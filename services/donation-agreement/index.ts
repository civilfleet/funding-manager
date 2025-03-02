import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { deleteFile } from "../file/s3-service";

type DonationAgreement = {
  agreement: string;
  file: string;
  fundingRequestId: string;
  contactPersons: string[];
};

const createDonationAgreement = async (donation: DonationAgreement) => {
  try {
    const session = await auth();
    const agreementData = await prisma.$transaction(async (prisma) => {
      const contacts = await prisma.contactPerson.findMany({
        where: {
          email: {
            in: donation?.contactPersons as string[],
          },
        },
      });

      const file = await prisma.file.create({
        data: {
          url: donation.file as string,
          type: "DONATION_AGREEMENT",
          createdBy: {
            connect: { id: session?.user?.contactId as string },
          },
          updatedBy: { connect: { id: session?.user?.contactId as string } },
        },
      });

      const organizationId = await prisma.fundingRequest.findUnique({
        where: {
          id: donation?.fundingRequestId,
        },
        select: {
          organizationId: true,
        },
      });

      const agreement = await prisma.donationAgreement.create({
        data: {
          agreement: donation.agreement as string,
          file: { connect: { id: file.id } },
          fundingRequest: { connect: { id: donation?.fundingRequestId } },
          createdBy: { connect: { id: session?.user?.contactId as string } },
          team: {
            connect: {
              id: session?.user?.teamId as string,
            },
          },
          organization: {
            connect: {
              id: organizationId?.organizationId as string,
            },
          },
        },
      });

      const agreementsToSignByContact = contacts.map((contact) => ({
        donationAgreementId: agreement.id,
        contactPersonId: contact.id,
      }));

      await prisma.donationAgreementSignature.createMany({
        data: agreementsToSignByContact,
      });

      await prisma.fundingRequest.update({
        where: {
          id: donation?.fundingRequestId,
        },
        data: {
          status: "Processing",
        },
      });

      return { agreement, file, contacts };
    });

    return {
      data: agreementData,
      message: "Donation agreement created successfully",
    };
  } catch (e) {
    throw e;
  }
};

const getDonationAgreements = async (
  { teamId, orgId }: { teamId: string; orgId: string },
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
      where["purpose"] = {
        contains: searchQuery,
      };
    }

    const donationAgreements = await prisma.donationAgreement.findMany({
      where: {
        ...where,
      },
      include: {
        contactSignatures: {
          select: {
            contactPerson: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        file: {
          select: {
            url: true,
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        fundingRequest: {
          select: {
            description: true,
            purpose: true,
            name: true,
          },
        },
      },
    });

    return donationAgreements;
  } catch (e) {
    throw e;
  }
};

const getDonationAgreementById = async (id: string) => {
  try {
    const donationAgreement = await prisma.donationAgreement.findUnique({
      where: {
        id,
      },
      include: {
        contactSignatures: {
          select: {
            contactPerson: {
              select: {
                name: true,
                email: true,
              },
            },
            signedAt: true,
          },
        },
        file: {
          select: {
            id: true,
            url: true,
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        fundingRequest: {
          select: {
            description: true,
            purpose: true,
            name: true,
            status: true,
          },
        },
      },
    });
    return donationAgreement;
  } catch (e) {
    throw e;
  }
};

const updateDonationAgreement = async (
  id: string,
  updatedDonationAgreement: DonationAgreement
) => {
  try {
    const session = await auth();
    const donation = await prisma.donationAgreement.findUnique({
      where: {
        id,
      },
      include: {
        file: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });
    await prisma.$transaction(async (prisma) => {
      await prisma.file.update({
        where: {
          id: donation?.fileId,
        },
        data: {
          url: updatedDonationAgreement.file as string,
          updatedBy: { connect: { id: session?.user?.contactId as string } },
        },
      });
      await prisma.donationAgreementSignature.update({
        where: {
          donationAgreementId_contactPersonId: {
            donationAgreementId: id,
            contactPersonId: session?.user?.contactId as string,
          },
        },
        data: {
          signedAt: new Date(),
        },
      });

      console.log("donation == == = = = =", donation);
    });

    await deleteFile(donation?.file.url as string);

    return { message: "Donation agreement updated successfully" };
  } catch (e) {
    throw e;
  }
};

export {
  createDonationAgreement,
  updateDonationAgreement,
  getDonationAgreements,
  getDonationAgreementById,
};
