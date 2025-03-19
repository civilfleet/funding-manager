import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { FileTypes, FundingStatus } from "@/types";

type FundingRequestData = {
  id?: string;
  name: string;
  organizationId?: string;
  description: string;
  purpose: string;
  amountRequested: number;
  amountAgreed?: number;
  refinancingConcept: string;
  sustainability: string;
  expectedCompletionDate: string;
  status: "Pending" | "UnderReview" | "Approved" | "Rejected";
  submittedBy?: string;
  files?: { name: string; url: string }[];
};

const createFundingRequest = async (data: FundingRequestData) => {
  const session = await auth();
  const completionDate = new Date(data.expectedCompletionDate);

  // Fetch the user person's ID
  const user = await prisma.user.findFirst({
    where: {
      email: session?.user.email as string,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error("User person not found.");
  }

  // Fetch organization details, including team email
  const organization = await prisma.organization.findUnique({
    where: {
      id: data.organizationId,
    },
    include: {
      team: {
        select: {
          id: true,
          email: true, // Include team email
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  if (!organization.isFilledByOrg) {
    throw new Error("Please fill in the organization details first.");
  }

  // Create the funding request
  const fundingRequest = await prisma.fundingRequest.create({
    data: {
      name: data.name,
      description: data.description,
      purpose: data.purpose,
      amountRequested: data.amountRequested,
      refinancingConcept: data.refinancingConcept,
      sustainability: data.sustainability,
      expectedCompletionDate: completionDate,
      organization: {
        connect: {
          id: data.organizationId,
        },
      },
      submittedBy: {
        connect: {
          id: user.id,
        },
      },
      team: {
        connect: {
          id: organization.teamId as string,
        },
      },
    },
  });

  // Save files associated with the funding request
  const files = data?.files?.map((file) => ({
    name: file.name,
    url: file.url,
    fundingRequestId: fundingRequest.id,
    organizationId: data.organizationId,
    createdById: user.id,
    updatedById: user.id,
    type: "FundingRequest",
  }));

  if (files && files.length > 0) {
    await prisma.file.createMany({
      data: files,
    });
  }

  return { fundingRequest, user, organization };
};

const updateFundingRequest = async (
  id: string,
  data: Partial<FundingRequestData>,
  teamId: string
) => {
  try {
    const team = await prisma.teams.findFirst({
      where: {
        id: teamId,
      },
    });
    if (!team) {
      throw new Error("Team not found.");
    }

    const fundingRequest = await prisma.fundingRequest.update({
      where: { id },
      data: data as Prisma.FundingRequestUpdateInput,
      select: {
        id: true,
        name: true,
        description: true,
        purpose: true,
        amountRequested: true,
        amountAgreed: true,
        refinancingConcept: true,
        sustainability: true,
        expectedCompletionDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        files: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
          },
        },
        organization: {
          select: {
            name: true,
            email: true,
            team: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        submittedBy: {
          select: {
            email: true,
          },
        },
      },
    });
    return fundingRequest;
  } catch (e) {
    throw e;
  }
};

const updateFundingRequestStatus = async (
  id: string,
  status: FundingStatus,
  donationId?: string | null
) => {
  const selectedFields = {
    id: true,
    name: true,
    description: true,
    purpose: true,
    amountRequested: true,
    amountAgreed: true,
    refinancingConcept: true,
    sustainability: true,
    expectedCompletionDate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    files: {
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
      },
    },
    organization: {
      select: {
        name: true,
        email: true,
        team: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    },
    submittedBy: {
      select: {
        email: true,
      },
    },
  };
  try {
    if (donationId) {
      const signedAgreements = await prisma.donationAgreementSignature.findMany(
        {
          where: {
            donationAgreementId: donationId as string,
            signedAt: null,
          },
        }
      );

      if (!signedAgreements?.length) {
        return await prisma.fundingRequest.update({
          where: { id },
          data: {
            status,
          },
          select: selectedFields,
        });
      }
    } else {
      return await prisma.fundingRequest.update({
        where: { id },
        data: {
          status,
        },
        select: selectedFields,
      });
    }
  } catch (e) {
    throw handlePrismaError(e);
  }
};

const uploadFundingRequestFile = async (
  fundingRequestId: string,
  file: string,
  type: FileTypes,
  userId: string
) => {
  return await prisma.file.create({
    data: {
      url: file,
      fundingRequestId,
      type: type,
      createdById: userId,
      updatedById: userId,
    },
    select: {
      FundingRequest: {
        select: {
          name: true,
          organization: {
            select: {
              name: true,
              email: true,
              team: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getFundingRequests = async (
  {
    teamId,
    orgId,
  }: {
    teamId: string;
    orgId: string;
  },
  searchQuery: string,
  status?: string[] | null
) => {
  const where: { [key: string]: any } = {};
  if (orgId) {
    where["organizationId"] = orgId;
  }
  if (teamId) {
    where["teamId"] = teamId;
  }
  if (searchQuery) {
    where["description"] = {
      contains: searchQuery,
    };
    where["purpose"] = {
      contains: searchQuery,
    };
    where["refinancingConcept"] = {
      contains: searchQuery,
    };
    where["sustainability"] = {
      contains: searchQuery,
    };
  }
  if (status?.length) {
    where["status"] = {
      in: status,
    };
  }

  const fundingRequests = await prisma.fundingRequest.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      purpose: true,
      amountRequested: true,
      amountAgreed: true,
      refinancingConcept: true,
      sustainability: true,
      expectedCompletionDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          name: true,
          url: true,
          type: true,
        },
      },
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      submittedBy: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return fundingRequests;
};

const getFundingRequestsByOrgId = async (searchQuery: string) => {
  const fundingRequests = await prisma.fundingRequest.findMany({
    where: {
      organization: {
        id: searchQuery,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      purpose: true,
      amountRequested: true,
      amountAgreed: true,
      refinancingConcept: true,
      sustainability: true,
      expectedCompletionDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      files: true,
      organization: {
        select: {
          name: true,
          email: true,
          Files: {
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
            },
          },
        },
      },
      submittedBy: {
        select: {
          email: true,
        },
      },
    },
  });
  return fundingRequests;
};

const getFundingRequestById = async (id: string) => {
  const fundingRequest = await prisma.fundingRequest.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      purpose: true,
      amountRequested: true,
      amountAgreed: true,
      refinancingConcept: true,
      sustainability: true,
      expectedCompletionDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      files: true,
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          postalCode: true,
          city: true,
          country: true,
          website: true,
          taxID: true,
          Files: {
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
            },
          },
          bankDetails: {
            select: {
              bankName: true,
              accountHolder: true,
              iban: true,
              bic: true,
            },
          },
        },
      },
      submittedBy: {
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
  return fundingRequest;
};

export {
  updateFundingRequest,
  createFundingRequest,
  getFundingRequests,
  getFundingRequestsByOrgId,
  getFundingRequestById,
  updateFundingRequestStatus,
  uploadFundingRequestFile,
};
