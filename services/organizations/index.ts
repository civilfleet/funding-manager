import _ from "lodash";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { handlePrismaError } from "@/lib/utils";

type Organization = {
  name?: string;
  email: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  taxExemptionCertificate?: string;
  articlesOfAssociation?: string;
  logo?: string;
  taxID?: string;
  teamId?: string;
  isFilledByOrg: boolean;
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  contactPerson?: {
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
};

const createOrUpdateOrganization = async (formData: Organization) => {
  try {
    return await prisma.$transaction(async (prisma) => {
      const session = await auth();
      const contact = await prisma.contactPerson.findFirst({
        where: { email: session?.user.email as string },
      });

      // Upsert bank details if provided
      const bankDetail = formData.bankDetails?.bankName
        ? await prisma.bankDetails.upsert({
            where: { iban: formData.bankDetails.iban },
            update: {
              ...formData.bankDetails,
              accountHolder: formData.bankDetails.accountHolder as string,
              iban: formData.bankDetails.iban as string,
              bic: formData.bankDetails.bic as string,
            },
            create: {
              ...formData.bankDetails,
              accountHolder: formData.bankDetails.accountHolder as string,
              iban: formData.bankDetails.iban as string,
              bic: formData.bankDetails.bic as string,
              bankName: formData.bankDetails.bankName as string,
            },
          })
        : undefined;

      // Upsert contact person if provided
      const contactPerson = formData.contactPerson?.email
        ? await prisma.contactPerson.upsert({
            where: { email: formData.contactPerson.email },
            update: { ...formData.contactPerson },
            create: { ...formData.contactPerson },
          })
        : undefined;

      // Common organization data
      const organizationData = {
        name: formData.name,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
        taxID: formData.taxID,
        isFilledByOrg: formData.isFilledByOrg,
        ...(bankDetail && { bankDetails: { connect: { id: bankDetail.id } } }),
        ...(contactPerson && {
          contactPersons: { connect: { id: contactPerson.id } },
        }),
      };

      // Organization update/create logic
      const organization = formData.teamId
        ? await prisma.organization.create({
            data: {
              ...organizationData,
              email: formData.email.toLowerCase(),
              team: { connect: { id: formData.teamId } },
            },
          })
        : await prisma.organization.update({
            where: { email: formData.email },
            data: organizationData,
          });

      // Batch file creation
      if (contact?.id) {
        const files = [
          {
            type: "TAX_EXEMPTION_CERTIFICATE",
            url: formData.taxExemptionCertificate,
          },
          {
            type: "ARTICLES_OF_ASSOCIATION",
            url: formData.articlesOfAssociation,
          },
          { type: "LOGO", url: formData.logo },
        ];

        await Promise.all(
          files.map(
            ({ type, url }) =>
              url &&
              prisma.file.create({
                data: {
                  type,
                  url,
                  createdBy: {
                    connect: { id: contact.id },
                  },
                  updatedBy: { connect: { id: contact.id } },
                  organization: { connect: { id: organization.id } },
                },
              })
          )
        );
      }

      return { organization, contactPerson, bankDetail };
    });
  } catch (e) {
    throw handlePrismaError(e);
  }
};
const getOrganizationById = async (id: string) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        bankDetails: true,
        Files: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        contactPersons: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            postalCode: true,
            city: true,
            country: true,
          },
        },
      },
    });
    return { ...organization, contactPerson: organization?.contactPersons[0] };
  } catch (error) {
    throw Error("Failed to get organization");
  }
};

const getOrganizationByEmail = async (email: string) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        email,
      },
      include: {
        bankDetails: true,
        Files: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        contactPersons: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            postalCode: true,
            city: true,
            country: true,
          },
        },
      },
    });
    if (organization?.contactPersons.length) {
      return {
        ...organization,
        contactPerson: organization.contactPersons[0] || {},
        taxExemptionCertificate: organization.Files.find(
          (file) => file.type === "TAX_EXEMPTION_CERTIFICATE"
        )?.id,
        articlesOfAssociation: organization.Files.find(
          (file) => file.type === "ARTICLES_OF_ASSOCIATION"
        )?.id,
        logo: organization.Files.find((file) => file.type === "LOGO")?.id,
      };
    }
  } catch (error) {
    throw Error("Failed to get organization");
  }
};

const getOrganizations = async (searchQuery: string, teamId: string) => {
  try {
    const organization = await prisma.organization.findMany({
      where: {
        teamId,
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
          { address: { contains: searchQuery, mode: "insensitive" } },
          { city: { contains: searchQuery, mode: "insensitive" } },
          { country: { contains: searchQuery, mode: "insensitive" } },
          { phone: { contains: searchQuery, mode: "insensitive" } },
          { website: { contains: searchQuery, mode: "insensitive" } },
          { taxID: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      include: {
        bankDetails: true,
        contactPersons: true,
      },
    });

    return organization;
  } catch (error) {
    throw Error("Failed to get organizations");
  }
};

export {
  createOrUpdateOrganization,
  getOrganizationByEmail,
  getOrganizations,
  getOrganizationById,
};
