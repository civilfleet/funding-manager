import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// type ContactPersonData = {
//   id: string;
//   name: string;
//   address: string;
//   email: string;
//   phone: string;
//   postalCode: string;
//   city: string;
//   country: string;
// };

const getContactPersonsByOrgId = async (id: string) => {
  try {
    const contactPerson = await prisma.contactPerson.findMany({
      where: {
        organizationId: id,
      },
    });

    return contactPerson;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const getContactPerson = async (searchQuery: string) => {
  try {
    const organization = await prisma.organization.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            country: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        bankDetails: true,
      },
    });

    return organization;
  } catch (error) {
    throw Error("Failed to get organizations");
  }
};

export { getContactPersonsByOrgId, getContactPerson };
