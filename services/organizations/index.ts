import _ from "lodash";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Roles } from "@prisma/client";

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
  user?: {
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
  return await prisma.$transaction(async (prisma) => {
    const session = await auth();

    const user = await prisma.user.findFirst({
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

    const email = formData.user?.email?.toLowerCase() as string;

    let orgUser = await prisma.user.findUnique({
      where: { email },
    });

    if (orgUser) {
      orgUser = await prisma.user.update({
        where: { email },
        data: {
          ...formData.user,
          roles: {
            set: Array.from(
              new Set([...(orgUser.roles ?? []), Roles.Organization])
            ),
          },
        },
      });
    } else {
      orgUser = await prisma.user.create({
        data: {
          ...formData.user,
          email,
          roles: [Roles.Organization],
        },
      });
    }

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
      ...(orgUser && {
        users: { connect: { id: orgUser.id } },
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
    console.log(
      "organization tax examption certificate",
      formData.taxExemptionCertificate
    );
    // Batch file creation
    if (user?.id) {
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
            prisma.file.upsert({
              where: { url },
              update: {
                type,
                url,
                updatedBy: { connect: { id: user.id } },
              },
              create: {
                type,
                url,
                createdBy: {
                  connect: { id: user.id },
                },
                updatedBy: { connect: { id: user.id } },
                organization: { connect: { id: organization.id } },
              },
            })
        )
      );
    }

    return { organization, user: orgUser, bankDetail };
  });
};
const updateOrganization = async (formData: Organization, id: string) => {
  const updatedOrganization = await prisma.organization.update({
    where: {
      id,
    },
    data: {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.phone,
      website: formData.website,
      taxID: formData.taxID,
      isFilledByOrg: formData.isFilledByOrg,
      bankDetails: {
        update: {
          accountHolder: formData.bankDetails?.accountHolder,
          iban: formData.bankDetails?.iban,
          bic: formData.bankDetails?.bic,
          bankName: formData.bankDetails?.bankName,
        },
      },
    },
  });
  return updatedOrganization;
};

const getOrganizationById = async (id: string) => {
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
      users: {
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
  return { ...organization, user: organization?.users[0] };
};

const getOrganizationByEmail = async (email: string) => {
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
      users: {
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
  if (organization?.users.length) {
    return {
      ...organization,
      user: organization.users[0] || {},
      taxExemptionCertificate: organization.Files.find(
        (file) => file.type === "TAX_EXEMPTION_CERTIFICATE"
      )?.id,
      articlesOfAssociation: organization.Files.find(
        (file) => file.type === "ARTICLES_OF_ASSOCIATION"
      )?.id,
      logo: organization.Files.find((file) => file.type === "LOGO")?.id,
    };
  }
};

const getOrganizations = async (searchQuery: string, teamId: string) => {
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
      users: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return organization;
};

export {
  createOrUpdateOrganization,
  getOrganizationByEmail,
  getOrganizations,
  updateOrganization,
  getOrganizationById,
};
