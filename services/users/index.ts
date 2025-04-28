import prisma from "@/lib/prisma";
import { Roles } from "@/types";
import { omit } from "lodash";

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
    teams,
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
        },
      },
    },
  });

  return user;
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
  searchQuery: string
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
    orderBy: { createdAt: "desc" },
  });
};

const getUsersForDonation = async ({ teamId, fundingRequestId }: { teamId: string; fundingRequestId: string }) => {
  const fundingRequest = await prisma.fundingRequest.findUnique({
    where: { id: fundingRequestId },
    select: { organizationId: true },
  });

  return await prisma.user.findMany({
    where: {
      OR: [{ organizations: { some: { id: fundingRequest?.organizationId } } }, { teams: { some: { id: teamId } } }],
    },
    orderBy: { createdAt: "desc" },
  });
};

const createUser = async (user: User) => {
  const teamId = user.teamId;
  const organizationId = user.organizationId;
  const newUser = await prisma.user.create({
    data: {
      ...omit(user, ["organizationId", "teamId"]),
      ...(organizationId && {
        organizations: {
          connect: [{ id: organizationId }],
        },
      }),
      ...(teamId && {
        teams: {
          connect: { id: teamId },
        },
      }),
      fundingRequests: undefined,
    },
  });

  return newUser;
};

const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
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

const deleteUser = async (userId: string, organizationId?: string, teamId?: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
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
