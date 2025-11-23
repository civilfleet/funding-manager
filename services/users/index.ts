import { omit } from "lodash";
import prisma from "@/lib/prisma";
import { ensureDefaultGroup } from "@/services/groups";
import {
  APP_MODULES,
  DEFAULT_TEAM_MODULES,
  type AppModule,
  type Roles,
} from "@/types";

export interface User {
  name?: string;
  address?: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  organizationId?: string;

  teamId?: string;
  roles: Roles[];
}

const getAdminUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      phone: true,
      postalCode: true,
      city: true,
      country: true,
      roles: true,
    },
  });
  const teams = await prisma.teams.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return {
    ...user,
    teams: teams.map((team) => ({
      ...team,
      modules: [...APP_MODULES],
    })),
    organizations,
  };
};

const getUserCurrent = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      phone: true,
      postalCode: true,
      city: true,
      country: true,
      roles: true,
      organizations: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      teams: {
        select: {
          id: true,
          name: true,

          email: true,
          ownerId: true,
        },
      },
    },
  });

  if (!user) {
    return user;
  }

  const teamIds = user.teams.map((team) => team.id);
  const modulesByTeam = new Map<string, Set<AppModule>>();

  if (teamIds.length > 0) {
    await Promise.all(teamIds.map((id) => ensureDefaultGroup(id)));

    const memberships = await prisma.userGroup.findMany({
      where: {
        userId,
        group: {
          teamId: {
            in: teamIds,
          },
        },
      },
      include: {
        group: {
          select: {
            teamId: true,
            modulePermissions: true,
          },
        },
      },
    });

    for (const membership of memberships) {
      const teamId = membership.group.teamId;
      const set = modulesByTeam.get(teamId) ?? new Set<AppModule>();

      if (!membership.group.modulePermissions.length) {
        for (const module of DEFAULT_TEAM_MODULES) {
          set.add(module);
        }
      } else {
        for (const permission of membership.group.modulePermissions) {
          set.add(permission.module as AppModule);
        }
      }

      modulesByTeam.set(teamId, set);
    }
  }

  let defaultGroupsByTeam: Map<string, AppModule[]> = new Map();

  if (teamIds.length > 0) {
    const defaultGroups = await prisma.group.findMany({
      where: {
        teamId: {
          in: teamIds,
        },
        isDefaultGroup: true,
      },
      include: {
        modulePermissions: true,
      },
    });

    defaultGroupsByTeam = new Map(
      defaultGroups.map((group) => [
        group.teamId,
        group.modulePermissions.length
          ? group.modulePermissions.map(
              (permission) => permission.module as AppModule,
            )
          : [...DEFAULT_TEAM_MODULES],
      ]),
    );
  }

  const teamsWithModules = user.teams.map((team) => {
    const set = modulesByTeam.get(team.id);

    const modules = new Set<AppModule>(set ?? []);

    const fallback = defaultGroupsByTeam.get(team.id);
    if (!modules.size && fallback?.length) {
      fallback.forEach((module) => modules.add(module));
    }

    if (!modules.size) {
      DEFAULT_TEAM_MODULES.forEach((module) => modules.add(module));
    }

    if (team.ownerId === userId) {
      modules.add("ADMIN");
    }

    return {
      ...team,
      modules: Array.from(modules),
    };
  });

  return {
    ...user,
    teams: teamsWithModules,
  };
};

const getUsers = async (
  {
    teamId,
    organizationId,
    fundingRequestId,
  }: {
    teamId?: string;
    organizationId?: string;
    fundingRequestId?: string;
  },
  searchQuery: string,
) => {
  const whereConditions = [];

  if (fundingRequestId) {
    const fundingRequest = await prisma.fundingRequest.findUnique({
      where: { id: fundingRequestId },
      select: { organizationId: true },
    });

    if (fundingRequest?.organizationId) {
      whereConditions.push({
        organizations: { some: { id: fundingRequest.organizationId } },
      });
    }
  }

  if (teamId) {
    // GET teams and organizations user.
    // const organizationIds = await prisma.organization
    //   .findMany({
    //     where: { teamId },
    //     select: { id: true },
    //   })
    //   .then((orgs) => orgs.map((org) => org.id));

    // whereConditions.push({
    //   OR: [
    //     ...(organizationIds.length > 0
    //       ? [{ organizations: { some: { id: { in: organizationIds } } } }]
    //       : []),
    //     { teams: { some: { id: teamId } } },
    //   ],
    // });

    // GET only teams user.
    whereConditions.push({ teams: { some: { id: teamId } } });
  } else if (organizationId) {
    whereConditions.push({ organizations: { some: { id: organizationId } } });
  }

  // Fetch users based on conditions
  return await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: ["name", "email", "address", "city", "country"].map((field) => ({
            [field]: { contains: searchQuery, mode: "insensitive" },
          })),
        },
        ...whereConditions,
      ],
    },
    include: teamId
      ? {
          groups: {
            where: {
              group: {
                teamId,
              },
            },
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  if (!teamId) {
    return await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: ["name", "email", "address", "city", "country"].map((field) => ({
              [field]: { contains: searchQuery, mode: "insensitive" },
            })),
          },
          ...whereConditions,
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: ["name", "email", "address", "city", "country"].map((field) => ({
            [field]: { contains: searchQuery, mode: "insensitive" },
          })),
        },
        ...whereConditions,
      ],
    },
    include: {
      groups: {
        where: {
          group: {
            teamId,
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getUsersForDonation = async ({
  teamId,
  fundingRequestId,
}: {
  teamId: string;
  fundingRequestId: string;
}) => {
  const fundingRequest = await prisma.fundingRequest.findUnique({
    where: { id: fundingRequestId },
    select: { organizationId: true },
  });

  return await prisma.user.findMany({
    where: {
      OR: [
        { organizations: { some: { id: fundingRequest?.organizationId } } },
        { teams: { some: { id: teamId } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};

const createUser = async (user: User) => {
  const teamId = user.teamId;
  const organizationId = user.organizationId;

  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      roles: true,
    },
  });

  const connectOrganizations = organizationId
    ? {
        organizations: {
          connect: [{ id: organizationId }],
        },
      }
    : {};

  const connectTeams = teamId
    ? {
        teams: {
          connect: { id: teamId },
        },
      }
    : {};

  const updatableFields = [
    "name",
    "address",
    "phone",
    "postalCode",
    "city",
    "country",
  ] as const;

  if (existingUser) {
    const updatedRoles = Array.from(
      new Set([...(existingUser.roles || []), ...(user.roles || [])]),
    );

    const data: Record<string, unknown> = {
      roles: {
        set: updatedRoles,
      },
      ...connectOrganizations,
      ...connectTeams,
    };

    for (const field of updatableFields) {
      const value = user[field];
      if (value !== undefined && value !== null) {
        data[field] = value;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data,
    });

    if (teamId) {
      await ensureDefaultGroup(teamId);
    }

    return updatedUser;
  }

  const newUser = await prisma.user.create({
    data: {
      ...omit(user, ["organizationId", "teamId"]),
      ...connectOrganizations,
      ...connectTeams,
      fundingRequests: undefined,
    },
  });

  if (teamId) {
    await ensureDefaultGroup(teamId);
  }

  return newUser;
};

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
};

const getTeamsUsers = async (teamId: string) => {
  const users = await prisma.user.findMany({
    where: {
      teams: {
        some: {
          id: teamId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const deleteUser = async (
  userId: string,
  organizationId?: string,
  teamId?: string,
) => {
    if (organizationId) {
      // Remove user from organization
      await prisma.user.update({
        where: { id: userId },
        data: {
          organizations: {
            disconnect: { id: organizationId },
          },
        },
      });
    }

    if (teamId) {
      await prisma.userGroup.deleteMany({
        where: {
          userId,
          group: {
            teamId,
          },
        },
      });

      // Remove user from team
      await prisma.user.update({
        where: { id: userId },
        data: {
          teams: {
            disconnect: { id: teamId },
          },
        },
      });
    }

    return true;
};

export {
  getUsers,
  getUserCurrent,
  createUser,
  getUserById,
  getTeamsUsers,
  getUsersForDonation,
  getAdminUser,
  deleteUser,
};
