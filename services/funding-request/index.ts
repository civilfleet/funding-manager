import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";
import { Prisma } from "@prisma/client";

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
  status?: string;
  submittedBy?: string;
};

const createFundingRequest = async (data: FundingRequestData) => {
  try {
    let contactPerson;
    if (data?.submittedBy) {
      contactPerson = await prisma.contactPerson.findFirst({
        where: {
          email: data?.submittedBy,
        },
        select: {
          id: true,
        },
      });
    }

    const fundingRequest = await prisma.fundingRequest.create({
      data: {
        description: data.description,
        purpose: data.purpose,
        amountRequested: data.amountRequested,
        refinancingConcept: data.refinancingConcept,
        sustainability: data.sustainability,
        expectedCompletionDate: new Date(data.expectedCompletionDate),
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
        submittedBy: {
          connect: {
            id: contactPerson?.id,
          },
        },
      },
    });
    return { ...fundingRequest };
  } catch (e) {
    handlePrismaError(e);
  }
};

const getFundingRequests = async () => {
  try {
    const fundingRequests = await prisma.fundingRequest.findMany({});
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
            taxExemptionCertificate: true,
            taxID: true,
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
  createFundingRequest,
  getFundingRequests,
  getFundingRequestsByOrgId,
  getFundingRequestById,
};
