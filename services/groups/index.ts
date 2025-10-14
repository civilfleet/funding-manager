import prisma from "@/lib/prisma";
import { Group } from "@/types";
import { Prisma } from "@prisma/client";

type CreateGroupInput = {
  teamId: string;
  name: string;
  description?: string;
  canAccessAllContacts?: boolean;
  userIds?: string[]; // Optional initial users
};

type UpdateGroupInput = {
  id: string;
  teamId: string;
  name?: string;
  description?: string;
  canAccessAllContacts?: boolean;
};

type AddUsersToGroupInput = {
  groupId: string;
  teamId: string;
  userIds: string[];
};

type RemoveUsersFromGroupInput = {
  groupId: string;
  teamId: string;
  userIds: string[];
};

type GroupWithDefaults = Prisma.GroupGetPayload<{}>;

const mapGroup = (group: GroupWithDefaults): Group => ({
  id: group.id,
  teamId: group.teamId,
  name: group.name,
  description: group.description ?? undefined,
  canAccessAllContacts: group.canAccessAllContacts,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

const getTeamGroups = async (teamId: string) => {
  const groups = await prisma.group.findMany({
    where: {
      teamId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return groups.map(mapGroup);
};

const getGroupById = async (groupId: string, teamId: string) => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      teamId,
    },
  });

  if (!group) {
    return null;
  }

  return mapGroup(group);
};

const getGroupWithUsers = async (groupId: string, teamId: string) => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      teamId,
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    return null;
  }

  return {
    ...mapGroup(group),
    users: group.users.map((ug) => ({
      id: ug.user.id,
      name: ug.user.name,
      email: ug.user.email,
    })),
  };
};

const createGroup = async (input: CreateGroupInput) => {
  const { teamId, name, description, canAccessAllContacts, userIds } = input;

  const group = await prisma.group.create({
    data: {
      teamId,
      name,
      description,
      canAccessAllContacts: canAccessAllContacts ?? false,
      users: userIds && userIds.length > 0
        ? {
            create: userIds.map((userId) => ({
              userId,
            })),
          }
        : undefined,
    },
  });

  return mapGroup(group);
};

const updateGroup = async (input: UpdateGroupInput) => {
  const { id, teamId, name, description, canAccessAllContacts } = input;

  const group = await prisma.group.update({
    where: {
      id,
      teamId,
    },
    data: {
      name,
      description,
      canAccessAllContacts,
    },
  });

  return mapGroup(group);
};

const deleteGroups = async (teamId: string, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await prisma.group.deleteMany({
    where: {
      id: { in: ids },
      teamId,
    },
  });
};

const addUsersToGroup = async (input: AddUsersToGroupInput) => {
  const { groupId, teamId, userIds } = input;

  // Verify group belongs to team
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      teamId,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  // Get existing user-group relationships
  const existing = await prisma.userGroup.findMany({
    where: {
      groupId,
      userId: { in: userIds },
    },
    select: { userId: true },
  });

  const existingUserIds = new Set(existing.map((ug) => ug.userId));
  const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

  if (newUserIds.length > 0) {
    await prisma.userGroup.createMany({
      data: newUserIds.map((userId) => ({
        groupId,
        userId,
      })),
    });
  }
};

const removeUsersFromGroup = async (input: RemoveUsersFromGroupInput) => {
  const { groupId, teamId, userIds } = input;

  // Verify group belongs to team
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      teamId,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  await prisma.userGroup.deleteMany({
    where: {
      groupId,
      userId: { in: userIds },
    },
  });
};

const getUserGroups = async (userId: string, teamId: string) => {
  const userGroups = await prisma.userGroup.findMany({
    where: {
      userId,
      group: {
        teamId,
      },
    },
    include: {
      group: true,
    },
  });

  return userGroups.map((ug) => mapGroup(ug.group));
};

export {
  getTeamGroups,
  getGroupById,
  getGroupWithUsers,
  createGroup,
  updateGroup,
  deleteGroups,
  addUsersToGroup,
  removeUsersFromGroup,
  getUserGroups,
};
