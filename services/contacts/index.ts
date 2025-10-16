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
  groupId?: string;
  profileAttributes?: ContactProfileAttribute[];
};

type UpdateContactInput = {
  contactId: string;
  teamId: string;
  name?: string;
  email?: string;
  phone?: string;
  groupId?: string;
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
    group: true;
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
    registrations: {
      include: {
        event: true;
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
  groupId: contact.groupId ?? undefined,
  group: contact.group
    ? {
        id: contact.group.id,
        teamId: contact.group.teamId,
        name: contact.group.name,
        description: contact.group.description ?? undefined,
        canAccessAllContacts: contact.group.canAccessAllContacts,
        createdAt: contact.group.createdAt,
        updatedAt: contact.group.updatedAt,
      }
    : undefined,
  profileAttributes: contact.attributes
    .map(toProfileAttribute)
    .filter((attribute): attribute is ContactProfileAttribute => Boolean(attribute)),
  events: (() => {
    const eventMap = new Map<
      string,
      {
        event: {
          id: string;
          teamId: string;
          title: string;
          description?: string;
          location?: string;
          startDate: Date;
          endDate?: Date;
          createdAt: Date;
          updatedAt: Date;
        };
        roles: { eventRole: { id: string; teamId: string; name: string; color?: string; createdAt: Date; updatedAt: Date } }[];
        participationTypes: Set<"linked" | "registered">;
        registration?: { id: string; createdAt: Date };
      }
    >();

    const upsertEvent = (eventId: string, entry: Partial<{
      event: {
        id: string;
        teamId: string;
        title: string;
        description?: string;
        location?: string;
        startDate: Date;
        endDate?: Date;
        createdAt: Date;
        updatedAt: Date;
      };
      roles: { eventRole: { id: string; teamId: string; name: string; color?: string; createdAt: Date; updatedAt: Date } }[];
      participationType: "linked" | "registered";
      registration: { id: string; createdAt: Date };
    }>) => {
      const existing = eventMap.get(eventId);
      if (existing) {
        if (entry.event) {
          existing.event = entry.event;
        }
        if (entry.roles) {
          existing.roles = entry.roles;
        }
        if (entry.participationType) {
          existing.participationTypes.add(entry.participationType);
        }
        if (entry.registration) {
          existing.registration = entry.registration;
        }
        return;
      }

      eventMap.set(eventId, {
        event: entry.event!,
        roles: entry.roles ?? [],
        participationTypes: new Set(entry.participationType ? [entry.participationType] : []),
        registration: entry.registration,
      });
    };

    const mapEventDetails = (event: ContactWithAttributes["events"][number]["event"]) => ({
      id: event.id,
      teamId: event.teamId,
      title: event.title,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      startDate: event.startDate,
      endDate: event.endDate ?? undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });

    (contact.events || []).forEach((eventContact) => {
      upsertEvent(eventContact.event.id, {
        event: mapEventDetails(eventContact.event),
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
        participationType: "linked",
      });
    });

    (contact.registrations || []).forEach((registration) => {
      upsertEvent(registration.event.id, {
        event: mapEventDetails(registration.event),
        participationType: "registered",
        registration: {
          id: registration.id,
          createdAt: registration.createdAt,
        },
      });
    });

    return Array.from(eventMap.values())
      .map((entry) => ({
        event: entry.event,
        roles: entry.roles,
        participationTypes: Array.from(entry.participationTypes),
        registration: entry.registration,
      }))
      .sort((a, b) => a.event.startDate.getTime() - b.event.startDate.getTime());
  })(),
  createdAt: contact.createdAt,
  updatedAt: contact.updatedAt,
});

const getTeamContacts = async (teamId: string, query?: string, userId?: string) => {
  const where: Prisma.ContactWhereInput = {
    teamId,
  };

  // If userId is provided, filter by group access
  if (userId) {
    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            canAccessAllContacts: true,
          },
        },
      },
    });

    // Check if user belongs to any group with canAccessAllContacts permission
    const hasAllAccessPermission = userGroups.some((ug) => ug.group.canAccessAllContacts);

    if (!hasAllAccessPermission) {
      // User can only see contacts with no group OR contacts in their groups
      const groupIds = userGroups.map((ug) => ug.groupId);
      where.OR = [
        { groupId: null },
        { groupId: { in: groupIds } },
      ];
    }
    // If user has canAccessAllContacts permission, don't apply any group filtering
  }

  if (query) {
    const searchConditions: Prisma.ContactWhereInput[] = [
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

    // Combine group filtering with search
    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions },
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      attributes: true,
      group: true,
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
      registrations: {
        include: {
          event: true,
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
      group: true,
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
      registrations: {
        include: {
          event: true,
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
  const { teamId, name, email, phone, groupId, profileAttributes } = input;
  const normalizedAttributes = normalizeAttributes(profileAttributes);
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }
  const normalizedPhone = phone ? phone.trim() : undefined;

  const existingContact = await prisma.contact.findFirst({
    where: {
      teamId,
      email: normalizedEmail,
    },
  });

  if (existingContact) {
    throw new Error("A contact with this email already exists for this team.");
  }

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        teamId,
        name: trimmedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        groupId,
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
    await logContactCreation(contact.id, userId, userName, tx, {
      source: "manual",
      createdVia: "contact-form",
    });

    const created = await tx.contact.findUniqueOrThrow({
      where: { id: contact.id },
      include: {
        attributes: true,
        group: true,
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
  const { contactId, teamId, name, email, phone, groupId, profileAttributes } = input;
  const normalizedName = typeof name === "string" ? name.trim() : undefined;
  const normalizedEmail = email === undefined ? undefined : email.trim().toLowerCase();
  const normalizedPhone = phone === undefined ? undefined : phone.trim();

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
    const updates: Prisma.ContactUncheckedUpdateInput = {};

    if (normalizedName !== undefined && normalizedName !== existing.name) {
      await logFieldUpdate(contactId, "name", existing.name, normalizedName, userId, userName, tx);
      updates.name = normalizedName;
    }

    if (normalizedEmail !== undefined && normalizedEmail !== existing.email) {
      if (normalizedEmail) {
        const conflictingContact = await tx.contact.findFirst({
          where: {
            teamId,
            email: normalizedEmail,
            id: { not: contactId },
          },
        });

        if (conflictingContact) {
          throw new Error("A contact with this email already exists for this team.");
        }
      }

      await logFieldUpdate(contactId, "email", existing.email, normalizedEmail, userId, userName, tx);
      updates.email = normalizedEmail;
    }

    if (normalizedPhone !== undefined && normalizedPhone !== existing.phone) {
      await logFieldUpdate(contactId, "phone", existing.phone, normalizedPhone, userId, userName, tx);
      updates.phone = normalizedPhone;
    }

    if (groupId !== undefined && groupId !== existing.groupId) {
      await logFieldUpdate(contactId, "groupId", existing.groupId, groupId, userId, userName, tx);
      updates.groupId = groupId;
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
        group: true,
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
