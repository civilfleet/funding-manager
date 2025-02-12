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
    // if contact or bank details data is available then
    // create contact first and bank detail
    // first so that we can link them with organization.
    console.log(formData);
    const session = await auth();
    const contact = await prisma.contactPerson.findFirst({
      where: {
        email: session?.user.email as string,
      },
    });

    const response = await prisma.$transaction(async (prisma) => {
      let bankDetail = undefined;

      // Upsert Bank Details if provided
      if (formData?.bankDetails?.bankName) {
        bankDetail = await prisma.bankDetails.upsert({
          where: {
            iban: formData.bankDetails.iban,
          },
          update: {
            bankName: formData.bankDetails.bankName,
            accountHolder: formData.bankDetails.accountHolder as string,
            iban: formData.bankDetails.iban as string,
            bic: formData.bankDetails.bic as string,
          },
          create: {
            bankName: formData.bankDetails.bankName,
            accountHolder: formData.bankDetails.accountHolder as string,
            iban: formData.bankDetails.iban as string,
            bic: formData.bankDetails.bic as string,
          },
        });
      }

      let organization;
      if (!formData.teamId) {
        // Upsert Organization
        organization = await prisma.organization.update({
          where: { email: formData.email },
          data: {
            name: formData.name,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city,
            country: formData.country,
            phone: formData.phone,
            website: formData.website,
            taxID: formData.taxID,
            isFilledByOrg: formData.isFilledByOrg,
            bankDetails: bankDetail
              ? { connect: { id: bankDetail.id } }
              : undefined,
          },
        });

        // create certificate of association and tax exemption certificate
        if (formData.taxExemptionCertificate && contact?.id) {
          await prisma.file.create({
            data: {
              url: formData.taxExemptionCertificate,
              createdBy: contact.id,
              updatedBy: contact?.id,
              organization: {
                connect: { id: organization.id },
              },
              type: "TAX_EXEMPTION_CERTIFICATE",
            },
          });
        }

        if (formData.articlesOfAssociation && contact?.id) {
          await prisma.file.create({
            data: {
              url: formData.articlesOfAssociation,
              createdBy: contact.id,
              updatedBy: contact?.id,
              organization: {
                connect: { id: organization.id },
              },
              type: "ARTICLES_OF_ASSOCIATION",
            },
          });
        }
        if (formData.logo && contact?.id) {
          await prisma.file.create({
            data: {
              url: formData.logo,

              createdBy: contact.id,
              updatedBy: contact?.id,
              organization: {
                connect: { id: organization.id },
              },
              type: "LOGO",
            },
          });
        }
      } else
        organization = await prisma.organization.create({
          data: {
            email: formData.email.toLowerCase(),
            name: formData.name,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city,
            country: formData.country,
            phone: formData.phone,
            website: formData.website,
            taxID: formData.taxID,
            isFilledByOrg: formData.isFilledByOrg,
            bankDetails: bankDetail
              ? { connect: { id: bankDetail.id } }
              : undefined,
            team: formData.teamId
              ? { connect: { id: formData.teamId } }
              : undefined,
          },
        });

      let contactPerson = null;
      // Upsert Contact Person if provided
      if (formData?.contactPerson?.email) {
        contactPerson = await prisma.contactPerson.upsert({
          where: {
            email: formData.contactPerson.email,
          },
          update: {
            name: formData.contactPerson.name,
            address: formData.contactPerson.address,
            phone: formData.contactPerson.phone,
            postalCode: formData.contactPerson.postalCode,
            city: formData.contactPerson.city,
            country: formData.contactPerson.country,
            organization: { connect: { id: organization.id } },
          },
          create: {
            name: formData.contactPerson.name,
            address: formData.contactPerson.address,
            email: formData.contactPerson.email,
            phone: formData.contactPerson.phone,
            postalCode: formData.contactPerson.postalCode,
            city: formData.contactPerson.city,
            country: formData.contactPerson.country,
            organization: { connect: { id: organization.id } },
          },
        });
      }

      return { organization, contactPerson, bankDetail };
    });

    return { ...response };
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
        Files: true,
      },
    });
    return { ...organization };
  } catch (error) {
    throw Error("Failed to get organization");
  }
};

const getOrganizationByEmail = async (email: string) => {
  try {
    const contactPerson = await prisma.contactPerson.findFirst({
      where: {
        email,
      },

      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        postalCode: true,
        city: true,
        country: true,
        organization: {
          include: {
            bankDetails: true,
            Files: true,
          },
        },
      },
    });
    if (contactPerson?.organization) {
      const organization = contactPerson?.organization;

      return {
        ...organization,
        contactPerson: _.omit(contactPerson, "organization", "Files"),
        taxExemptionCertificate: organization.Files.find(
          (file) => file.type === "TAX_EXEMPTION_CERTIFICATE"
        )?.url,
        articlesOfAssociation: organization.Files.find(
          (file) => file.type === "ARTICLES_OF_ASSOCIATION"
        )?.url,
        logo: organization.Files.find((file) => file.type === "LOGO")?.url,
      };
    }
  } catch (error) {
    throw Error("Failed to get organization");
  }
};

const getOrganizations = async (searchQuery: string) => {
  try {
    const organization = await prisma.organization.findMany({
      where: {
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
