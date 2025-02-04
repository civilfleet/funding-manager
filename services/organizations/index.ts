import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  taxID?: string;
  teamId?: string;
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
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

    let contactPerson = null;
    let bankDetail = null;

    if (formData?.contactPerson?.email) {
      contactPerson = await prisma.contactPerson.upsert({
        where: {
          email: formData?.contactPerson.email,
        },
        update: {
          name: formData?.contactPerson.name,
          address: formData?.contactPerson.address,
          email: formData?.contactPerson.email,
          phone: formData?.contactPerson.phone,
          postalCode: formData?.contactPerson.postalCode,
          city: formData?.contactPerson.city,
          country: formData?.contactPerson.country,
        },
        create: {
          name: formData?.contactPerson.name,
          address: formData?.contactPerson.address,
          email: formData?.contactPerson.email,
          phone: formData?.contactPerson.phone,
          postalCode: formData?.contactPerson.postalCode,
          city: formData?.contactPerson.city,
          country: formData?.contactPerson.country,
        },
      });
    }

    if (formData?.bankDetails && formData.bankDetails.bankName) {
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

    const response = await prisma.organization.upsert({
      where: {
        email: formData.email,
      },
      update: {
        name: formData.name,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
        taxID: formData.taxID,
        bankDetails: bankDetail
          ? { connect: { id: bankDetail.id } }
          : undefined,
        contactPerson: contactPerson
          ? { connect: { id: contactPerson.id } }
          : undefined,
        team: {
          connect: { id: formData.teamId },
        },
      },
      create: {
        email: formData.email,
        name: formData.name,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
        taxID: formData.taxID,
        bankDetails: bankDetail
          ? { connect: { id: bankDetail.id } }
          : undefined,
        contactPerson: contactPerson
          ? { connect: { id: contactPerson.id } }
          : undefined,
        team: {
          connect: { id: formData.teamId },
        },
      },
    });

    return { ...response };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        console.log("ERROR 🔴:  Organization already exist with this email");
      }
    }
    throw Error("Organization already exist with this email");
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
        contactPerson: true,
      },
    });

    return { ...organization };
  } catch (error) {
    throw Error("Failed to get organization");
  }
};

export { createOrUpdateOrganization, getOrganizationByEmail };
