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
  bankDetails?: {
    account_holder?: string;
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
  // if contact or bank details data is available then create contact first and bank detail first so that we can link them with organization.
  const contactPerson = null;
  if (formData?.contactPerson?.email) {
    console.log("create organization!!!!");
    const response = await prisma.contactPerson.create({
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
    console.log(response.id);
    console.log(response);
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
    },
  });
  console.log("response", response);
  return { ...response };
};

export { createOrganization };
