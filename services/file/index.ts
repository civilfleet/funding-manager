import { auth } from "@/auth";
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
    const session = await auth();
    console.log("file query", searchQuery);
    const whereConditions = [];
    console.log(organizationId, teamId, "organizationId, teamId");

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
          organizationId: { in: organizationIds },
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
