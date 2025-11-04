import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ensureDefaultGroup } from "@/services/groups";
import { Roles } from "@/types";

type CreateContactListInput = {
  teamId: string;
  name: string;
  description?: string;
  contactIds?: string[];
};

type UpdateContactListInput = {
  id: string;
  teamId: string;
  name?: string;
  description?: string;
};

type AddContactsInput = {
  listId: string;
  teamId: string;
  contactIds: string[];
};

type RemoveContactsInput = {
  listId: string;
  teamId: string;
  contactIds: string[];
};

const buildContactVisibilityFilter = async (
  teamId: string,
  userId?: string,
  roles: Roles[] = [],
): Promise<Prisma.ContactListMemberWhereInput | undefined> => {
  if (!userId || roles.includes(Roles.Admin)) {
    return undefined;
  }

  await ensureDefaultGroup(teamId);

  const memberships = await prisma.userGroup.findMany({
    where: {
      userId,
      group: {
        teamId,
      },
    },
    select: {
      groupId: true,
      group: {
        select: {
          canAccessAllContacts: true,
        },
      },
    },
  });

  if (memberships.some((membership) => membership.group.canAccessAllContacts)) {
    return undefined;
  }

  const accessibleGroupIds = memberships
    .map((membership) => membership.groupId)
    .filter((id): id is string => Boolean(id));

  if (!accessibleGroupIds.length) {
    return {
      contact: {
        groupId: null,
      },
    };
  }

  return {
    contact: {
      OR: [{ groupId: null }, { groupId: { in: accessibleGroupIds } }],
    },
  };
};

const getTeamContactLists = async (
  teamId: string,
  userId?: string,
  roles: Roles[] = [],
) => {
  const contactAccessWhere = await buildContactVisibilityFilter(
    teamId,
    userId,
    roles,
  );

  const lists = await prisma.contactList.findMany({
    where: {
      teamId,
    },
    include: {
      contacts: {
        ...(contactAccessWhere ? { where: contactAccessWhere } : {}),
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return lists.map((list) => ({
    id: list.id,
    teamId: list.teamId,
    name: list.name,
    description: list.description ?? undefined,
    contactCount: list.contacts.length,
    contacts: list.contacts.map((c) => c.contact),
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }));
};

const getContactListById = async (
  listId: string,
  teamId: string,
  userId?: string,
  roles: Roles[] = [],
) => {
  const contactAccessWhere = await buildContactVisibilityFilter(
    teamId,
    userId,
    roles,
  );

  const list = await prisma.contactList.findFirst({
    where: {
      id: listId,
      teamId,
    },
    include: {
      contacts: {
        ...(contactAccessWhere ? { where: contactAccessWhere } : {}),
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!list) {
    return null;
  }

  return {
    id: list.id,
    teamId: list.teamId,
    name: list.name,
    description: list.description ?? undefined,
    contacts: list.contacts.map((c) => c.contact),
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
};

const createContactList = async (input: CreateContactListInput) => {
  const { teamId, name, description, contactIds } = input;

  const list = await prisma.contactList.create({
    data: {
      teamId,
      name,
      description,
      contacts:
        contactIds && contactIds.length > 0
          ? {
              create: contactIds.map((contactId) => ({
                contactId,
              })),
            }
          : undefined,
    },
    include: {
      _count: {
        select: {
          contacts: true,
        },
      },
    },
  });

  return {
    id: list.id,
    teamId: list.teamId,
    name: list.name,
    description: list.description ?? undefined,
    contactCount: list._count.contacts,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
};

const updateContactList = async (input: UpdateContactListInput) => {
  const { id, teamId, name, description } = input;

  const list = await prisma.contactList.update({
    where: {
      id,
      teamId,
    },
    data: {
      name,
      description,
    },
    include: {
      _count: {
        select: {
          contacts: true,
        },
      },
    },
  });

  return {
    id: list.id,
    teamId: list.teamId,
    name: list.name,
    description: list.description ?? undefined,
    contactCount: list._count.contacts,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
};

const deleteContactLists = async (teamId: string, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await prisma.contactList.deleteMany({
    where: {
      id: { in: ids },
      teamId,
    },
  });
};

const addContactsToList = async (input: AddContactsInput) => {
  const { listId, teamId, contactIds } = input;

  // Verify list belongs to team
  const list = await prisma.contactList.findFirst({
    where: {
      id: listId,
      teamId,
    },
  });

  if (!list) {
    throw new Error("List not found");
  }

  // Get existing contacts in list
  const existing = await prisma.contactListMember.findMany({
    where: {
      listId,
      contactId: { in: contactIds },
    },
    select: { contactId: true },
  });

  const existingContactIds = new Set(existing.map((m) => m.contactId));
  const newContactIds = contactIds.filter((id) => !existingContactIds.has(id));

  if (newContactIds.length > 0) {
    await prisma.contactListMember.createMany({
      data: newContactIds.map((contactId) => ({
        listId,
        contactId,
      })),
    });
  }
};

const removeContactsFromList = async (input: RemoveContactsInput) => {
  const { listId, teamId, contactIds } = input;

  // Verify list belongs to team
  const list = await prisma.contactList.findFirst({
    where: {
      id: listId,
      teamId,
    },
  });

  if (!list) {
    throw new Error("List not found");
  }

  await prisma.contactListMember.deleteMany({
    where: {
      listId,
      contactId: { in: contactIds },
    },
  });
};

export {
  getTeamContactLists,
  getContactListById,
  createContactList,
  updateContactList,
  deleteContactLists,
  addContactsToList,
  removeContactsFromList,
};
