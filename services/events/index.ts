import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type EventContactInput = {
  contactId: string;
  roleIds?: string[];
};

type CreateEventInput = {
  teamId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  contacts?: EventContactInput[];
};

type UpdateEventInput = {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
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
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
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

const mapEvent = (event: EventWithContacts): EventType => ({
  id: event.id,
  teamId: event.teamId,
  title: event.title,
  description: event.description ?? undefined,
  location: event.location ?? undefined,
  startDate: event.startDate,
  endDate: event.endDate ?? undefined,
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
  const { teamId, title, description, location, startDate, endDate, contacts = [] } = input;

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        teamId,
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    if (contacts.length > 0) {
      // Extract contact IDs
      const contactIds = contacts.map((c) => c.contactId);

      // Verify all contacts belong to the same team
      const validContacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });

      const validContactIds = new Set(validContacts.map((c) => c.id));

      // Filter to only valid contacts
      const validContactsWithRoles = contacts.filter((c) => validContactIds.has(c.contactId));

      if (validContactsWithRoles.length > 0) {
        // Create EventContact entries
        await tx.eventContact.createMany({
          data: validContactsWithRoles.map((c) => ({
            eventId: event.id,
            contactId: c.contactId,
          })),
        });

        // Create EventContactRole entries
        for (const contact of validContactsWithRoles) {
          if (contact.roleIds && contact.roleIds.length > 0) {
            // Verify roles belong to team
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
  const { id, teamId, title, description, location, startDate, endDate, contacts = [] } = input;

  return prisma.$transaction(async (tx) => {
    // Verify event belongs to team
    const existingEvent = await tx.event.findFirst({
      where: { id, teamId },
    });

    if (!existingEvent) {
      throw new Error("Event not found");
    }

    const event = await tx.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    // Delete existing contact associations (cascades to role associations)
    await tx.eventContact.deleteMany({
      where: { eventId: id },
    });

    // Add new contact associations
    if (contacts.length > 0) {
      // Extract contact IDs
      const contactIds = contacts.map((c) => c.contactId);

      // Verify all contacts belong to the same team
      const validContacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });

      const validContactIds = new Set(validContacts.map((c) => c.id));

      // Filter to only valid contacts
      const validContactsWithRoles = contacts.filter((c) => validContactIds.has(c.contactId));

      if (validContactsWithRoles.length > 0) {
        // Create EventContact entries
        await tx.eventContact.createMany({
          data: validContactsWithRoles.map((c) => ({
            eventId: event.id,
            contactId: c.contactId,
          })),
        });

        // Create EventContactRole entries
        for (const contact of validContactsWithRoles) {
          if (contact.roleIds && contact.roleIds.length > 0) {
            // Verify roles belong to team
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
