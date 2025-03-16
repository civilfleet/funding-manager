import team from "@/app/admin/page";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
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
const getUserCurrent = async () => {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.userId,
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
          roleName: true,
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
  }: {
    teamId?: string;
    organizationId?: string;
  },
  searchQuery: string
) => {
  const whereConditions = [];

  if (teamId) {
    const organizationIds = await prisma.organization
      .findMany({
        where: { teamId },
        select: { id: true },
      })
      .then((orgs) => orgs.map((org) => org.id));

    const teamOrOrganizationConditions = [];

    if (organizationIds.length > 0) {
      teamOrOrganizationConditions.push({
        organizations: { some: { id: { in: organizationIds } } },
      });
    }

    teamOrOrganizationConditions.push({
      teams: { some: { id: teamId } },
    });

    whereConditions.push({
      OR: teamOrOrganizationConditions,
    });
  } else if (organizationId) {
    whereConditions.push({
      organizations: { some: { id: organizationId } },
    });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
            { address: { contains: searchQuery, mode: "insensitive" } },
            { city: { contains: searchQuery, mode: "insensitive" } },
            { country: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
        ...whereConditions,
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const createUser = async (user: User) => {
  const session = await auth();

  const newUser = await prisma.user.create({
    data: {
      ...omit(user, ["organizationId", "teamId"]),
      // Conditionally connect organization only if ID exists
      ...(session?.user.organizationId && {
        organizations: {
          connect: [{ id: session.user.organizationId }],
        },
      }),
      // Conditionally connect team only if ID exists
      ...(session?.user.teamId && {
        teams: {
          connect: { id: session.user.teamId },
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
export { getUsers, getUserCurrent, createUser, getUserById, getTeamsUsers };
