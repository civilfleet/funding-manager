import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";

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
  _searchQuery: string,
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

  const users = await prisma.file.findMany({
    where,
    include: {
      organization: {
        select: {
          name: true,
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

export { getFileById, getFiles };
