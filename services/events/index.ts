import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type CreateEventInput = {
  teamId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  contactIds?: string[];
};

type UpdateEventInput = {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  contactIds?: string[];
};

type EventWithContacts = Prisma.EventGetPayload<{
  include: {
    contacts: {
      include: {
        contact: true;
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
  const { teamId, title, description, location, startDate, endDate, contactIds = [] } = input;

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

    if (contactIds.length > 0) {
      // Verify all contacts belong to the same team
      const contacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });

      const validContactIds = contacts.map((c) => c.id);

      if (validContactIds.length > 0) {
        await tx.eventContact.createMany({
          data: validContactIds.map((contactId) => ({
            eventId: event.id,
            contactId,
          })),
        });
      }
    }

    const created = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        contacts: {
          include: {
            contact: true,
          },
        },
      },
    });

    return mapEvent(created);
  });
};

export const updateEvent = async (input: UpdateEventInput) => {
  const { id, teamId, title, description, location, startDate, endDate, contactIds = [] } = input;

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

    // Delete existing contact associations
    await tx.eventContact.deleteMany({
      where: { eventId: id },
    });

    // Add new contact associations
    if (contactIds.length > 0) {
      // Verify all contacts belong to the same team
      const contacts = await tx.contact.findMany({
        where: {
          id: { in: contactIds },
          teamId,
        },
        select: { id: true },
      });

      const validContactIds = contacts.map((c) => c.id);

      if (validContactIds.length > 0) {
        await tx.eventContact.createMany({
          data: validContactIds.map((contactId) => ({
            eventId: event.id,
            contactId,
          })),
        });
      }
    }

    const updated = await tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        contacts: {
          include: {
            contact: true,
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
