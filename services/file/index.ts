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
  searchQuery: string
) => {
  try {
    console.log("search query ", searchQuery);
    const whereConditions = [];

    if (teamId) {
      const organizationIds = await prisma.organization
        .findMany({
          where: { teamId },
          select: { id: true },
        })
        .then((orgs) => orgs.map((org) => org.id));

      console.log(organizationIds, "organizationIds");

      if (organizationIds.length > 0) {
        whereConditions.push({
          OR: [{ organizationId: { in: organizationIds } }],
        });
      }
    } else if (organizationId) {
      whereConditions.push({
        organizationId,
      });
    }

    const contactPersons = await prisma.file.findMany({
      where: {
        ...whereConditions[0],
      },
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
    });

    return contactPersons;
  } catch (error) {
    throw error;
  }
};

export { getFileById, getFiles };
