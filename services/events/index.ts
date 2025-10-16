import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateSlug } from "@/lib/slug";
import { logContactCreation, logFieldUpdate } from "@/services/contact-change-logs";

type EventContactInput = {
  contactId: string;
  roleIds?: string[];
};

type CreateEventInput = {
  teamId: string;
  title: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
  contacts?: EventContactInput[];
};

type UpdateEventInput = {
  id: string;
  teamId: string;
  title: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
  contacts?: EventContactInput[];
};

type EventWithContacts = Prisma.EventGetPayload<{
  include: {
    contacts: {
      include: {
        contact: true;
        roles: {
          include: {
            eventRole: true;
          };
        };
      };
    };
  };
}>;

type EventType = {
  id: string;
  teamId: string;
  title: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  contacts: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    roles: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
  }>;
};

const ensureSlug = (raw: string, fallback: string) => {
  const source = raw || fallback;
  const slug = generateSlug(source);

  if (!slug) {
    throw new Error("Slug cannot be empty. Provide letters or numbers.");
  }

  return slug;
};

const mapEvent = (event: EventWithContacts): EventType => ({
  id: event.id,
  teamId: event.teamId,
  title: event.title,
  slug: event.slug ?? undefined,
  description: event.description ?? undefined,
  location: event.location ?? undefined,
  startDate: event.startDate,
  endDate: event.endDate ?? undefined,
  isPublic: event.isPublic,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
  contacts: event.contacts.map((ec) => ({
    id: ec.contact.id,
    name: ec.contact.name,
    email: ec.contact.email ?? undefined,
    phone: ec.contact.phone ?? undefined,
    roles: ec.roles.map((r) => ({
      id: r.eventRole.id,
      name: r.eventRole.name,
      color: r.eventRole.color ?? undefined,
    })),
  })),
});
export const getTeamEvents = async (teamId: string, query?: string) => {
  const where: Prisma.EventWhereInput = {
    teamId,
  };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
      {
        contacts: {
          some: {
            contact: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }
  const events = await prisma.event.findMany({
    where,
    include: {
      contacts: {
        include: {
          contact: true,
          roles: {
            include: {
              eventRole: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });
  return events.map(mapEvent);
};
export const getEventById = async (eventId: string, teamId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      teamId,
    },
    include: {
      contacts: {
        include: {
          contact: true,
          roles: {
            include: {
              eventRole: true,
            },
          },
        },
      },
    },
  });
  if (!event) {
    return null;
  }
  return mapEvent(event);
};
export const createEvent = async (input: CreateEventInput) => {
  const { teamId, title, slug, description, location, startDate, endDate, isPublic = false, contacts = [] } = input;
  return prisma.$transaction(async (tx) => {
    const eventSlug = ensureSlug(slug ?? "", title);
    const existingEvent = await tx.event.findFirst({
      where: { teamId, slug: eventSlug },
    });
    if (existingEvent) {
      throw new Error("Slug is already in use for this team. Choose a different slug.");
    }
    const event = await tx.event.create({
      data: {
        teamId,
        title,
        slug: eventSlug,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isPublic,
      },
    });
    if (contacts.length > 0) {
      const contactIds = contacts.map((c) => c.contactId);
      const validContacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });
      const validContactIds = new Set(validContacts.map((c) => c.id));
      const validContactsWithRoles = contacts.filter((c) => validContactIds.has(c.contactId));
      if (validContactsWithRoles.length > 0) {
        await tx.eventContact.createMany({
          data: validContactsWithRoles.map((c) => ({
            eventId: event.id,
            contactId: c.contactId,
          })),
        });
        for (const contact of validContactsWithRoles) {
          if (contact.roleIds && contact.roleIds.length > 0) {
            const validRoles = await tx.eventRole.findMany({
              where: {
                id: { in: contact.roleIds },
                teamId,
              },
              select: { id: true },
            });
            const validRoleIds = validRoles.map((r) => r.id);
            if (validRoleIds.length > 0) {
              await tx.eventContactRole.createMany({
                data: validRoleIds.map((roleId) => ({
                  eventId: event.id,
                  contactId: contact.contactId,
                  eventRoleId: roleId,
                })),
              });
            }
          }
        }
      }
    }
    const created = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        contacts: {
          include: {
            contact: true,
            roles: {
              include: {
                eventRole: true,
              },
            },
          },
        },
      },
    });
    return mapEvent(created);
  });
};
export const updateEvent = async (input: UpdateEventInput) => {
  const { id, teamId, title, slug, description, location, startDate, endDate, isPublic, contacts = [] } = input;
  return prisma.$transaction(async (tx) => {
    const existingEvent = await tx.event.findFirst({
      where: { id, teamId },
    });
    if (!existingEvent) {
      throw new Error("Event not found");
    }
    let eventSlug = existingEvent.slug ?? null;
    if (slug !== undefined) {
      eventSlug = ensureSlug(slug, title);
      const conflictingEvent = await tx.event.findFirst({
        where: { teamId, slug: eventSlug, id: { not: id } },
      });
      if (conflictingEvent) {
        throw new Error("Slug is already in use for this team. Choose a different slug.");
      }
    } else if (!eventSlug) {
      eventSlug = ensureSlug("", title);
    }
    const event = await tx.event.update({
      where: { id },
      data: {
        title,
        slug: eventSlug,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isPublic: isPublic !== undefined ? isPublic : existingEvent.isPublic,
      },
    });
    await tx.eventContact.deleteMany({
      where: { eventId: id },
    });
    if (contacts.length > 0) {
      const contactIds = contacts.map((c) => c.contactId);
      const validContacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });
      const validContactIds = new Set(validContacts.map((c) => c.id));
      const validContactsWithRoles = contacts.filter((c) => validContactIds.has(c.contactId));
      if (validContactsWithRoles.length > 0) {
        await tx.eventContact.createMany({
          data: validContactsWithRoles.map((c) => ({
            eventId: event.id,
            contactId: c.contactId,
          })),
        });
        for (const contact of validContactsWithRoles) {
          if (contact.roleIds && contact.roleIds.length > 0) {
            const validRoles = await tx.eventRole.findMany({
              where: {
                id: { in: contact.roleIds },
                teamId,
              },
              select: { id: true },
            });
            const validRoleIds = validRoles.map((r) => r.id);
            if (validRoleIds.length > 0) {
              await tx.eventContactRole.createMany({
                data: validRoleIds.map((roleId) => ({
                  eventId: event.id,
                  contactId: contact.contactId,
                  eventRoleId: roleId,
                })),
              });
            }
          }
        }
      }
    }
    const updated = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        contacts: {
          include: {
            contact: true,
            roles: {
              include: {
                eventRole: true,
              },
            },
          },
        },
      },
    });
    return mapEvent(updated);
  });
};
export const deleteEvents = async (teamId: string, ids: string[]) => {
  if (!ids.length) {
    return;
  }
  await prisma.event.deleteMany({
    where: {
      id: { in: ids },
      teamId,
    },
  });
};
// Get a public event by slug (for public registration pages)
export const getPublicEventBySlug = async (teamId: string, slug: string) => {
  const event = await prisma.event.findFirst({
    where: {
      teamId,
      slug,
      isPublic: true,
    },
    select: {
      id: true,
      teamId: true,
      title: true,
      slug: true,
      description: true,
      location: true,
      startDate: true,
      endDate: true,
      team: {
        select: {
          name: true,
          email: true,
          website: true,
        },
      },
    },
  });
  return event;
};
// Create a new event registration
type CreateEventRegistrationInput = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, unknown>;
};
export const createEventRegistration = async (input: CreateEventRegistrationInput) => {
  const { eventId, name, email, phone, notes, customData } = input;

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,
        isPublic: true,
      },
      select: {
        teamId: true,
        title: true,
      },
    });

    if (!event) {
      throw new Error("Event not found or not accepting registrations");
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error("Email is required");
    }
    const trimmedPhone = phone?.trim() || undefined;

    let contact = await tx.contact.findFirst({
      where: {
        teamId: event.teamId,
        ...(trimmedEmail
          ? {
              email: {
                equals: trimmedEmail,
                mode: "insensitive",
              },
            }
          : {}),
      },
    });

    if (!contact && trimmedPhone) {
      contact = await tx.contact.findFirst({
        where: {
          teamId: event.teamId,
          phone: trimmedPhone,
        },
      });
    }

    if (contact) {
      const contactUpdates: Prisma.ContactUpdateInput = {};
      const updatedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

      if ((!contact.name || contact.name.trim().length === 0) && trimmedName) {
        contactUpdates.name = trimmedName;
        updatedFields.push({ field: "name", oldValue: contact.name, newValue: trimmedName });
      }

      if (!contact.email && trimmedEmail) {
        contactUpdates.email = trimmedEmail;
        updatedFields.push({ field: "email", oldValue: contact.email, newValue: trimmedEmail });
      }

      if (!contact.phone && trimmedPhone) {
        contactUpdates.phone = trimmedPhone;
        updatedFields.push({ field: "phone", oldValue: contact.phone, newValue: trimmedPhone });
      }

      if (Object.keys(contactUpdates).length > 0) {
        contact = await tx.contact.update({
          where: { id: contact.id },
          data: contactUpdates,
        });

        for (const updatedField of updatedFields) {
          await logFieldUpdate(
            contact.id,
            updatedField.field,
            updatedField.oldValue,
            updatedField.newValue,
            undefined,
            undefined,
            tx
          );
        }
      }
    } else {
      contact = await tx.contact.create({
        data: {
          teamId: event.teamId,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
        },
      });

      await logContactCreation(contact.id, undefined, undefined, tx, {
        source: "event-registration",
        eventId,
        eventTitle: event.title ?? null,
      });
    }

    const registration = await tx.eventRegistration.create({
      data: {
        eventId,
        contactId: contact.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        notes,
        customData: customData ? JSON.parse(JSON.stringify(customData)) : null,
      },
      include: {
        contact: true,
      },
    });

    return registration;
  });
};
// Get registrations for an event
export const getEventRegistrations = async (eventId: string, teamId: string) => {
  // Verify event belongs to team
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
  });
  if (!event) {
    throw new Error("Event not found");
  }
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      contact: true,
    },
  });
  return registrations;
};
