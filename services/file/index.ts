import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { Roles } from "@/types";

const getFileById = async (id: string) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id,
      },
    });

    return file;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const getFiles = async (
  {
    organizationId,
    teamId,
  }: {
  organizationId: string | undefined;
  teamId: string | undefined;
  },
  searchQuery: string,
) => {
  let where: Prisma.FileWhereInput = {};

  if (teamId) {
    const organizationIds = await prisma.organization
      .findMany({
        where: { teamId },
        select: { id: true },
      })
      .then((orgs) => orgs.map((org) => org.id));

    where = {
      OR: [
        ...(organizationIds.length > 0
          ? [{ organizationId: { in: organizationIds } }]
          : []),
        { FundingRequest: { teamId } },
        { donationAgreement: { some: { teamId } } },
        { Transaction: { some: { teamId } } },
      ],
    };
  } else if (organizationId) {
    where = {
      OR: [
        { organizationId },
        { FundingRequest: { organizationId } },
        { donationAgreement: { some: { organizationId } } },
        { Transaction: { some: { organizationId } } },
      ],
    };
  }

  if (searchQuery.trim()) {
    const queryFilter: Prisma.FileWhereInput = {
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { type: { contains: searchQuery, mode: "insensitive" } },
        { url: { contains: searchQuery, mode: "insensitive" } },
      ],
    };

    where = Object.keys(where).length
      ? {
          AND: [where, queryFilter],
        }
      : queryFilter;
  }

  const users = await prisma.file.findMany({
    where,
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      FundingRequest: {
        select: {
          id: true,
          name: true,
          teamId: true,
          organizationId: true,
        },
      },
      donationAgreement: {
        select: {
          id: true,
          teamId: true,
          organizationId: true,
          fundingRequest: {
            select: {
              name: true,
            },
          },
        },
      },
      Transaction: {
        select: {
          id: true,
          teamId: true,
          organizationId: true,
          fundingRequest: {
            select: {
              name: true,
            },
          },
        },
      },
      updatedBy: {
        select: {
          email: true,
        },
      },
      createdBy: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const getFileByIdWithRelations = async (id: string) => {
  return prisma.file.findUnique({
    where: { id },
    include: {
      FundingRequest: {
        select: {
          teamId: true,
          organizationId: true,
        },
      },
      donationAgreement: {
        select: {
          teamId: true,
          organizationId: true,
        },
      },
      Transaction: {
        select: {
          teamId: true,
          organizationId: true,
        },
      },
    },
  });
};

const getUserAccessScope = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roles: true,
      teams: { select: { id: true } },
      organizations: { select: { id: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    roles: user.roles,
    teamIds: user.teams.map((team) => team.id),
    organizationIds: user.organizations.map((organization) => organization.id),
  };
};

const canUserAccessTeamOrOrgScope = async ({
  userId,
  teamId,
  organizationId,
}: {
  userId: string;
  teamId?: string;
  organizationId?: string;
}) => {
  const scope = await getUserAccessScope(userId);
  if (scope.roles.includes(Roles.Admin)) return true;
  if (teamId && scope.teamIds.includes(teamId)) return true;
  if (organizationId && scope.organizationIds.includes(organizationId)) return true;
  return false;
};

const canUserAccessFile = async ({
  userId,
  fileId,
}: {
  userId: string;
  fileId: string;
}) => {
  const [scope, file] = await Promise.all([
    getUserAccessScope(userId),
    getFileByIdWithRelations(fileId),
  ]);
  if (!file) return false;
  if (scope.roles.includes(Roles.Admin)) return true;

  if (file.organizationId && scope.organizationIds.includes(file.organizationId)) {
    return true;
  }

  if (
    file.FundingRequest?.teamId &&
    scope.teamIds.includes(file.FundingRequest.teamId)
  ) {
    return true;
  }
  if (
    file.FundingRequest?.organizationId &&
    scope.organizationIds.includes(file.FundingRequest.organizationId)
  ) {
    return true;
  }

  if (
    file.donationAgreement.some(
      (agreement) =>
        (agreement.teamId && scope.teamIds.includes(agreement.teamId)) ||
        (agreement.organizationId &&
          scope.organizationIds.includes(agreement.organizationId)),
    )
  ) {
    return true;
  }

  if (
    file.Transaction.some(
      (transaction) =>
        scope.teamIds.includes(transaction.teamId) ||
        scope.organizationIds.includes(transaction.organizationId),
    )
  ) {
    return true;
  }

  return false;
};

export {
  canUserAccessFile,
  canUserAccessTeamOrOrgScope,
  getFileById,
  getFiles,
};
