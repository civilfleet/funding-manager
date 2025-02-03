import prisma from "@/lib/prisma";

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
  teamId: string;
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

const createOrganization = async (formData: Organization) => {
  try {
    // if contact or bank details data is available then create contact first and bank detail first so that we can link them with organization.
    let contactPerson = null;
    let bankDetail = null;

    console.log("create organization!!!!", formData);

    if (formData?.contactPerson?.email) {
      contactPerson = await prisma.contactPerson.create({
        data: {
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
      bankDetail = await prisma.bankDetails.create({
        data: {
          bankName: formData.bankDetails.bankName,
          accountHolder: formData.bankDetails.accountHolder as string,
          iban: formData.bankDetails.iban as string,
          bic: formData.bankDetails.bic as string,
        },
      });
    }

    const response = await prisma.organization.create({
      data: {
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
  } catch (error) {
    console.error("Error creating organization:", error);
    throw new Error("Failed to create organization");
  }
};

export { createOrganization };
