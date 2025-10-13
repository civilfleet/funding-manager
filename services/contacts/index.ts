import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  Contact as ContactType,
  ContactAttributeType,
  ContactLocationValue,
  ContactProfileAttribute,
} from "@/types";
import { logContactCreation, logFieldUpdate } from "@/services/contact-change-logs";

type CreateContactInput = {
  teamId: string;
  name: string;
  email?: string;
  phone?: string;
  profileAttributes?: ContactProfileAttribute[];
};

type UpdateContactInput = {
  contactId: string;
  teamId: string;
  name?: string;
  email?: string;
  phone?: string;
  profileAttributes?: ContactProfileAttribute[];
};

type NormalizedAttribute = {
  key: string;
  type: ContactAttributeType;
  stringValue?: string;
  numberValue?: Prisma.Decimal;
  dateValue?: Date;
  locationLabel?: string;
  latitude?: Prisma.Decimal;
  longitude?: Prisma.Decimal;
};

type ContactWithAttributes = Prisma.ContactGetPayload<{
  include: {
    attributes: true;
    events: {
      include: {
        event: true;
        roles: {
          include: {
            eventRole: true;
          };
        };
      };
    };
  };
}>;

const normalizeAttributes = (
  attributes: ContactProfileAttribute[] = []
): NormalizedAttribute[] => {
  const seenKeys = new Set<string>();
  const normalized: NormalizedAttribute[] = [];

  attributes.forEach((attribute) => {
    const key = attribute.key.trim();
    if (!key || seenKeys.has(key)) {
      return;
    }

    switch (attribute.type) {
      case ContactAttributeType.STRING: {
        if (typeof attribute.value === "string" && attribute.value.trim()) {
          normalized.push({
            key,
            type: ContactAttributeType.STRING,
            stringValue: attribute.value.trim(),
          });
          seenKeys.add(key);
        }
        break;
      }
      case ContactAttributeType.DATE: {
        if (typeof attribute.value === "string" && attribute.value.trim()) {
          const parsed = new Date(attribute.value);
          if (!Number.isNaN(parsed.getTime())) {
            const isoValue = parsed.toISOString();
            normalized.push({
              key,
              type: ContactAttributeType.DATE,
              dateValue: parsed,
              stringValue: isoValue,
            });
            seenKeys.add(key);
          }
        }
        break;
      }
      case ContactAttributeType.NUMBER: {
        if (typeof attribute.value === "number" && Number.isFinite(attribute.value)) {
          normalized.push({
            key,
            type: ContactAttributeType.NUMBER,
            numberValue: new Prisma.Decimal(attribute.value),
            stringValue: attribute.value.toString(),
          });
          seenKeys.add(key);
        }
        break;
      }
      case ContactAttributeType.LOCATION: {
        const { value } = attribute;
        if (!value || typeof value !== "object") {
          break;
        }

        const location: NormalizedAttribute = {
          key,
          type: ContactAttributeType.LOCATION,
        };

        if (value.label && value.label.trim()) {
          location.locationLabel = value.label.trim();
        }

        if (typeof value.latitude === "number" && Number.isFinite(value.latitude)) {
          location.latitude = new Prisma.Decimal(value.latitude);
        }

        if (typeof value.longitude === "number" && Number.isFinite(value.longitude)) {
          location.longitude = new Prisma.Decimal(value.longitude);
        }

        if (location.locationLabel || location.latitude || location.longitude) {
          normalized.push(location);
          seenKeys.add(key);
        }
        break;
      }
      default:
        break;
    }
  });

  return normalized;
};

const toProfileAttribute = (
  attribute: ContactWithAttributes["attributes"][number]
): ContactProfileAttribute | null => {
  switch (attribute.type) {
    case ContactAttributeType.STRING:
      return attribute.stringValue
        ? {
            key: attribute.key,
            type: ContactAttributeType.STRING,
            value: attribute.stringValue,
          }
        : null;
    case ContactAttributeType.DATE:
      return attribute.dateValue
        ? {
            key: attribute.key,
            type: ContactAttributeType.DATE,
            value: attribute.dateValue.toISOString(),
          }
        : null;
    case ContactAttributeType.NUMBER:
      return attribute.numberValue !== null && attribute.numberValue !== undefined
        ? {
            key: attribute.key,
            type: ContactAttributeType.NUMBER,
            value: attribute.numberValue.toNumber(),
          }
        : null;
    case ContactAttributeType.LOCATION: {
      const value: ContactLocationValue = {};

      if (attribute.locationLabel) {
        value.label = attribute.locationLabel;
      }

      if (attribute.latitude) {
        value.latitude = attribute.latitude.toNumber();
      }

      if (attribute.longitude) {
        value.longitude = attribute.longitude.toNumber();
      }

      return Object.keys(value).length > 0
        ? {
            key: attribute.key,
            type: ContactAttributeType.LOCATION,
            value,
          }
        : null;
    }
    default:
      return null;
  }
};

const mapContact = (contact: ContactWithAttributes): ContactType => ({
  id: contact.id,
  teamId: contact.teamId,
  name: contact.name,
  email: contact.email ?? undefined,
  phone: contact.phone ?? undefined,
  profileAttributes: contact.attributes
    .map(toProfileAttribute)
    .filter((attribute): attribute is ContactProfileAttribute => Boolean(attribute)),
  events: (contact.events || []).map((eventContact) => ({
    event: {
      id: eventContact.event.id,
      teamId: eventContact.event.teamId,
      title: eventContact.event.title,
      description: eventContact.event.description ?? undefined,
      location: eventContact.event.location ?? undefined,
      startDate: eventContact.event.startDate,
      endDate: eventContact.event.endDate ?? undefined,
      createdAt: eventContact.event.createdAt,
      updatedAt: eventContact.event.updatedAt,
    },
    roles: eventContact.roles.map((role) => ({
      eventRole: {
        id: role.eventRole.id,
        teamId: role.eventRole.teamId,
        name: role.eventRole.name,
        color: role.eventRole.color ?? undefined,
        createdAt: role.eventRole.createdAt,
        updatedAt: role.eventRole.updatedAt,
      },
    })),
  })),
  createdAt: contact.createdAt,
  updatedAt: contact.updatedAt,
});

const getTeamContacts = async (teamId: string, query?: string) => {
  const where: Prisma.ContactWhereInput = {
    teamId,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      {
        attributes: {
          some: {
            OR: [
              { key: { contains: query, mode: "insensitive" } },
              { stringValue: { contains: query, mode: "insensitive" } },
              { locationLabel: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      attributes: true,
      events: {
        include: {
          event: true,
          roles: {
            include: {
              eventRole: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return contacts.map(mapContact);
};

const getContactById = async (contactId: string, teamId: string) => {
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      teamId,
    },
    include: {
      attributes: true,
      events: {
        include: {
          event: true,
          roles: {
            include: {
              eventRole: true,
            },
          },
        },
      },
    },
  });

  if (!contact) {
    return null;
  }

  return mapContact(contact);
};

const createContact = async (input: CreateContactInput, userId?: string, userName?: string) => {
  const { teamId, name, email, phone, profileAttributes } = input;
  const normalizedAttributes = normalizeAttributes(profileAttributes);

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        teamId,
        name,
        email,
        phone,
      },
    });

    if (normalizedAttributes.length > 0) {
      for (const attribute of normalizedAttributes) {
        await tx.contactAttribute.create({
          data: {
            contactId: contact.id,
            key: attribute.key,
            type: attribute.type,
            stringValue: attribute.stringValue,
            numberValue: attribute.numberValue,
            dateValue: attribute.dateValue,
            locationLabel: attribute.locationLabel,
            latitude: attribute.latitude,
            longitude: attribute.longitude,
          },
        });
      }
    }

    // Log contact creation
    await logContactCreation(contact.id, userId, userName, tx);

    const created = await tx.contact.findUniqueOrThrow({
      where: { id: contact.id },
      include: {
        attributes: true,
        events: {
          include: {
            event: true,
            roles: {
              include: {
                eventRole: true,
              },
            },
          },
        },
      },
    });

    return mapContact(created);
  });
};

const updateContact = async (input: UpdateContactInput, userId?: string, userName?: string) => {
  const { contactId, teamId, name, email, phone, profileAttributes } = input;

  return prisma.$transaction(async (tx) => {
    // Get the existing contact
    const existing = await tx.contact.findFirst({
      where: {
        id: contactId,
        teamId,
      },
      include: {
        attributes: true,
      },
    });

    if (!existing) {
      throw new Error("Contact not found");
    }

    // Track changes to basic fields
    const updates: Prisma.ContactUpdateInput = {};

    if (name !== undefined && name !== existing.name) {
      await logFieldUpdate(contactId, "name", existing.name, name, userId, userName, tx);
      updates.name = name;
    }

    if (email !== undefined && email !== existing.email) {
      await logFieldUpdate(contactId, "email", existing.email, email, userId, userName, tx);
      updates.email = email;
    }

    if (phone !== undefined && phone !== existing.phone) {
      await logFieldUpdate(contactId, "phone", existing.phone, phone, userId, userName, tx);
      updates.phone = phone;
    }

    // Update basic contact fields if there are changes
    if (Object.keys(updates).length > 0) {
      await tx.contact.update({
        where: { id: contactId },
        data: updates,
      });
    }

    // Handle profile attributes if provided
    if (profileAttributes !== undefined) {
      const normalizedAttributes = normalizeAttributes(profileAttributes);

      // Get existing attributes as a map
      const existingAttrsMap = new Map(
        existing.attributes.map((attr) => [attr.key, attr])
      );

      // Get new attributes as a map
      const newAttrsMap = new Map(
        normalizedAttributes.map((attr) => [attr.key, attr])
      );

      // Find attributes to delete (in existing but not in new)
      for (const [key, existingAttr] of existingAttrsMap) {
        if (!newAttrsMap.has(key)) {
          const oldValue = toProfileAttribute(existingAttr);
          await logFieldUpdate(
            contactId,
            `profileAttribute.${key}`,
            oldValue,
            null,
            userId,
            userName,
            tx
          );
          await tx.contactAttribute.delete({
            where: { id: existingAttr.id },
          });
        }
      }

      // Find attributes to add or update
      for (const [key, newAttr] of newAttrsMap) {
        const existingAttr = existingAttrsMap.get(key);

        if (!existingAttr) {
          // New attribute - create it
          await logFieldUpdate(
            contactId,
            `profileAttribute.${key}`,
            null,
            newAttr,
            userId,
            userName,
            tx
          );
          await tx.contactAttribute.create({
            data: {
              contactId,
              key: newAttr.key,
              type: newAttr.type,
              stringValue: newAttr.stringValue,
              numberValue: newAttr.numberValue,
              dateValue: newAttr.dateValue,
              locationLabel: newAttr.locationLabel,
              latitude: newAttr.latitude,
              longitude: newAttr.longitude,
            },
          });
        } else {
          // Check if attribute changed
          const oldValue = toProfileAttribute(existingAttr);
          const hasChanged =
            existingAttr.type !== newAttr.type ||
            existingAttr.stringValue !== newAttr.stringValue ||
            existingAttr.numberValue?.toString() !== newAttr.numberValue?.toString() ||
            existingAttr.dateValue?.toISOString() !== newAttr.dateValue?.toISOString() ||
            existingAttr.locationLabel !== newAttr.locationLabel ||
            existingAttr.latitude?.toString() !== newAttr.latitude?.toString() ||
            existingAttr.longitude?.toString() !== newAttr.longitude?.toString();

          if (hasChanged) {
            await logFieldUpdate(
              contactId,
              `profileAttribute.${key}`,
              oldValue,
              newAttr,
              userId,
              userName,
              tx
            );
            await tx.contactAttribute.update({
              where: { id: existingAttr.id },
              data: {
                type: newAttr.type,
                stringValue: newAttr.stringValue,
                numberValue: newAttr.numberValue,
                dateValue: newAttr.dateValue,
                locationLabel: newAttr.locationLabel,
                latitude: newAttr.latitude,
                longitude: newAttr.longitude,
              },
            });
          }
        }
      }
    }

    // Return updated contact
    const updated = await tx.contact.findUniqueOrThrow({
      where: { id: contactId },
      include: {
        attributes: true,
        events: {
          include: {
            event: true,
            roles: {
              include: {
                eventRole: true,
              },
            },
          },
        },
      },
    });

    return mapContact(updated);
  });
};

const deleteContacts = async (teamId: string, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await prisma.contact.deleteMany({
    where: {
      id: { in: ids },
      teamId,
    },
  });
};

export { getTeamContacts, getContactById, createContact, updateContact, deleteContacts };
