import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { APP_MODULES, AppModule, Group } from "@/types";

type CreateGroupInput = {
  teamId: string;
  name: string;
  description?: string;
  canAccessAllContacts?: boolean;
  userIds?: string[]; // Optional initial users
  modules?: AppModule[];
};

type UpdateGroupInput = {
  id: string;
  teamId: string;
  name?: string;
  description?: string;
  canAccessAllContacts?: boolean;
  modules?: AppModule[];
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

type GroupWithDefaults = Prisma.GroupGetPayload<{
  include: {
    modulePermissions: true;
  };
}>;

const DEFAULT_GROUP_NAME = "Default Access";

const ensureDefaultGroup = async (
  teamId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  let defaultGroup = await client.group.findFirst({
    where: {
      teamId,
      isDefaultGroup: true,
    },
    include: {
      modulePermissions: true,
    },
  });

  if (!defaultGroup) {
    const existing = await client.group.findFirst({
      where: {
        teamId,
        name: DEFAULT_GROUP_NAME,
      },
      include: {
        modulePermissions: true,
      },
    });

    if (existing) {
      defaultGroup = await client.group.update({
        where: { id: existing.id },
        data: { isDefaultGroup: true, canAccessAllContacts: true },
        include: {
          modulePermissions: true,
        },
      });
    } else {
      defaultGroup = await client.group.create({
        data: {
          teamId,
          name: DEFAULT_GROUP_NAME,
          description: "Default access group",
          isDefaultGroup: true,
          canAccessAllContacts: true,
          modulePermissions: {
            create: APP_MODULES.map((module) => ({ module })),
          },
        },
        include: {
          modulePermissions: true,
        },
      });
    }
  }

  if (!defaultGroup) {
    throw new Error("Default group could not be ensured");
  }

  let ensuredDefaultGroup: GroupWithDefaults = defaultGroup;

  if (!ensuredDefaultGroup.canAccessAllContacts) {
    await client.group.update({
      where: { id: ensuredDefaultGroup.id },
      data: { canAccessAllContacts: true },
    });

    ensuredDefaultGroup = await client.group.findUniqueOrThrow({
      where: { id: ensuredDefaultGroup.id },
      include: {
        modulePermissions: true,
      },
    });
  }

  if (!ensuredDefaultGroup.modulePermissions.length) {
    await client.groupModulePermission.createMany({
      data: APP_MODULES.map((module) => ({
        groupId: ensuredDefaultGroup.id,
        module,
      })),
      skipDuplicates: true,
    });

    ensuredDefaultGroup = await client.group.findUniqueOrThrow({
      where: { id: ensuredDefaultGroup.id },
      include: {
        modulePermissions: true,
      },
    });
  }

  const teamUsers = await client.teams.findUnique({
    where: { id: teamId },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (teamUsers?.users?.length) {
    const teamUserIds = teamUsers.users.map((user) => user.id);

    const usersWithOtherGroups = await client.userGroup.findMany({
      where: {
        userId: { in: teamUserIds },
        group: {
          teamId,
          isDefaultGroup: false,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const userIdsWithOtherGroups = new Set(
      usersWithOtherGroups.map((entry) => entry.userId),
    );

    const userIdsNeedingDefault = teamUserIds.filter(
      (userId) => !userIdsWithOtherGroups.has(userId),
    );

    if (userIdsNeedingDefault.length) {
      await client.userGroup.createMany({
        data: userIdsNeedingDefault.map((userId) => ({
          groupId: ensuredDefaultGroup.id,
          userId,
        })),
        skipDuplicates: true,
      });
    }

    if (userIdsWithOtherGroups.size) {
      await client.userGroup.deleteMany({
        where: {
          groupId: ensuredDefaultGroup.id,
          userId: { in: Array.from(userIdsWithOtherGroups) },
        },
      });
    }
  }

  return ensuredDefaultGroup;
};

const mapGroup = (group: GroupWithDefaults): Group => ({
  id: group.id,
  teamId: group.teamId,
  name: group.name,
  description: group.description ?? undefined,
  canAccessAllContacts: group.canAccessAllContacts,
  isDefaultGroup: group.isDefaultGroup,
  modules: group.modulePermissions.length
    ? group.modulePermissions.map(
        (permission) => permission.module as AppModule,
      )
    : [...APP_MODULES],
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

const getTeamGroups = async (teamId: string) => {
  await ensureDefaultGroup(teamId);

  const groups = await prisma.group.findMany({
    where: {
      teamId,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      modulePermissions: true,
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

  return groups.map((group) => ({
    ...mapGroup(group),
    users: group.users.map((ug) => ({
      userId: ug.userId,
      user: {
        id: ug.user.id,
        name: ug.user.name,
        email: ug.user.email,
      },
    })),
  }));
};

const getGroupById = async (groupId: string, teamId: string) => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      teamId,
    },
    include: {
      modulePermissions: true,
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
      modulePermissions: true,
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
  const { teamId, name, description, canAccessAllContacts, userIds, modules } =
    input;

  const baseModules = modules && modules.length ? modules : [...APP_MODULES];
  const modulesToAssign: AppModule[] = Array.from(
    new Set(
      baseModules.filter((module): module is AppModule =>
        APP_MODULES.includes(module),
      ),
    ),
  );

  const group = await prisma.$transaction(async (tx) => {
    const created = await tx.group.create({
      data: {
        teamId,
        name,
        description,
        canAccessAllContacts: canAccessAllContacts ?? false,
        modulePermissions: {
          create: modulesToAssign.map((module) => ({ module })),
        },
        users:
          userIds && userIds.length > 0
            ? {
                create: userIds.map((userId) => ({
                  userId,
                })),
              }
            : undefined,
      },
      include: {
        modulePermissions: true,
      },
    });

    await ensureDefaultGroup(teamId, tx);

    return created;
  });

  return mapGroup(group);
};

const updateGroup = async (input: UpdateGroupInput) => {
  const { id, teamId, name, description, canAccessAllContacts, modules } =
    input;

  const result = await prisma.$transaction(async (tx) => {
    await tx.group.update({
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

    if (modules !== undefined) {
      const baseModules = modules.length ? modules : [...APP_MODULES];
      const modulesToAssign: AppModule[] = Array.from(
        new Set(
          baseModules.filter((module): module is AppModule =>
            APP_MODULES.includes(module),
          ),
        ),
      );

      await tx.groupModulePermission.deleteMany({
        where: { groupId: id },
      });

      if (modulesToAssign.length) {
        await tx.groupModulePermission.createMany({
          data: modulesToAssign.map((module) => ({
            groupId: id,
            module,
          })),
        });
      }
    }

    await ensureDefaultGroup(teamId, tx);

    const updated = await tx.group.findUniqueOrThrow({
      where: { id },
      include: {
        modulePermissions: true,
      },
    });

    return updated;
  });

  return mapGroup(result);
};

const deleteGroups = async (teamId: string, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const defaultGroup = await ensureDefaultGroup(teamId, tx);

    if (ids.includes(defaultGroup.id)) {
      throw new Error("Default group cannot be deleted");
    }

    await tx.group.deleteMany({
      where: {
        id: { in: ids },
        teamId,
      },
    });

    await ensureDefaultGroup(teamId, tx);
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

  if (group.isDefaultGroup) {
    throw new Error("Cannot manually assign users to the default group");
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

  await ensureDefaultGroup(teamId);
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

  if (group.isDefaultGroup) {
    throw new Error("Cannot manually remove users from the default group");
  }

  await prisma.userGroup.deleteMany({
    where: {
      groupId,
      userId: { in: userIds },
    },
  });

  await ensureDefaultGroup(teamId);
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
      group: {
        include: {
          modulePermissions: true,
        },
      },
    },
  });

  return userGroups.map((ug) => mapGroup(ug.group));
};

const getUserModuleAccess = async (
  userId: string,
  teamId: string,
): Promise<AppModule[]> => {
  const groups = await getUserGroups(userId, teamId);

  if (!groups.length) {
    const defaultGroup = await ensureDefaultGroup(teamId);
    return defaultGroup.modulePermissions.length
      ? defaultGroup.modulePermissions.map(
          (permission) => permission.module as AppModule,
        )
      : [...APP_MODULES];
  }

  const modules = new Set<AppModule>();

  for (const group of groups) {
    for (const moduleName of group.modules) {
      modules.add(moduleName);
    }
  }

  if (modules.size) {
    return Array.from(modules);
  }

  const defaultGroup = await ensureDefaultGroup(teamId);

  return defaultGroup.modulePermissions.length
    ? defaultGroup.modulePermissions.map(
        (permission) => permission.module as AppModule,
      )
    : [...APP_MODULES];
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
  ensureDefaultGroup,
  getUserModuleAccess,
  mapGroup,
};
