import team from "@/app/admin/page";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { omit } from "lodash";

export interface ContactPerson {
  name?: string;
  address?: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  organizationId?: string;

  teamId?: string;
  type: "Organization" | "Team" | "Admin";
}
const getContactPersonCurrent = async () => {
  try {
    const session = await auth();
    const contact = await prisma.contactPerson.findUnique({
      where: {
        id: session?.user.contactId,
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
        type: true,
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

    return contact;
  } catch (error) {
    throw error;
  }
};

const getContactPersons = async (
  {
    teamId,
    organizationId,
  }: {
    teamId?: string;
    organizationId?: string;
  },
  searchQuery: string
) => {
  try {
    const whereConditions = [];

    if (teamId) {
      const organizationIds = await prisma.organization
        .findMany({
          where: { teamId },
          select: { id: true },
        })
        .then((orgs) => orgs.map((org) => org.id));

      console.log(organizationIds, "organizationIds");

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

    console.log(whereConditions, "whereConditions");

    const contactPersons = await prisma.contactPerson.findMany({
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
    });

    return contactPersons;
  } catch (error) {
    throw error;
  }
};

const createContactPerson = async (contact: ContactPerson) => {
  try {
    const session = await auth();

    const contactPerson = await prisma.contactPerson.create({
      data: {
        ...omit(contact, ["organizationId", "teamId"]),
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

    return contactPerson;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const getContactPersonById = async (id: string) => {
  try {
    const contactPerson = await prisma.contactPerson.findUnique({
      where: {
        id,
      },
    });

    return contactPerson;
  } catch (error) {
    throw error;
  }
};

const getTeamsContactPersons = async (teamId: string) => {
  try {
    const contactPersons = await prisma.contactPerson.findMany({
      where: {
        teams: {
          some: {
            id: teamId,
          },
        },
      },
    });

    return contactPersons;
  } catch (error) {
    throw error;
  }
};
export {
  getContactPersons,
  getContactPersonCurrent,
  createContactPerson,
  getContactPersonById,
  getTeamsContactPersons,
};
