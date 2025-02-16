import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";

type FundingRequestData = {
  id?: string;
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

  const contactPerson = await prisma.contactPerson.findFirst({
    where: {
      email: session?.user.email as string,
    },
    select: {
      id: true,
    },
  });
  try {
    const completionDate = new Date(data.expectedCompletionDate);
    const team = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
      select: {
        teamId: true,
      },
    });
    const fundingRequest = await prisma.fundingRequest.create({
      data: {
        description: data.description,
        purpose: data.purpose,
        amountRequested: data.amountRequested,
        refinancingConcept: data.refinancingConcept,
        sustainability: data.sustainability,
        expectedCompletionDate: completionDate,
        organization: {
          connect: {
            id: data.organizationId as string,
          },
        },
        submittedBy: {
          connect: {
            id: contactPerson?.id as string,
          },
        },

        team: {
          connect: {
            id: team?.teamId as string,
          },
        },
      },
    });

    const files = data?.files?.map((file) => {
      return {
        name: file.name,
        url: file.url,
        fundingRequestId: fundingRequest.id as string,
        organizationId: data.organizationId as string,
        createdBy: contactPerson?.id as string,
        updatedBy: contactPerson?.id as string,
        type: "FundingRequest",
      };
    });

    if (files) {
      await prisma.file.createMany({
        data: files,
      });
    }

    return { ...fundingRequest };
  } catch (e) {
    handlePrismaError(e);
  }
};
const updateFundingRequest = async (
  id: string,
  data: Partial<FundingRequestData>
) => {
  try {
    const fundingRequest = await prisma.fundingRequest.update({
      where: { id },
      data: data as Prisma.FundingRequestUpdateInput,
    });
    return { ...fundingRequest };
  } catch (e) {
    handlePrismaError(e);
  }
};

const getFundingRequests = async (
  {
    teamId,
    orgId,
  }: {
    teamId: string;
    orgId: string;
  },
  searchQuery: string
) => {
  try {
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

    console.log("where", where);
    const fundingRequests = await prisma.fundingRequest.findMany({
      where,
      select: {
        id: true,
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
    });
    return fundingRequests;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const getFundingRequestsByOrgId = async (searchQuery: string) => {
  try {
    const fundingRequests = await prisma.fundingRequest.findMany({
      where: {
        organization: {
          id: searchQuery,
        },
      },
      select: {
        id: true,
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
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const getFundingRequestById = async (id: string) => {
  try {
    const fundingRequest = await prisma.fundingRequest.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
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
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export {
  updateFundingRequest,
  createFundingRequest,
  getFundingRequests,
  getFundingRequestsByOrgId,
  getFundingRequestById,
};
