import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { deleteFile } from "../file/s3-service";

type DonationAgreement = {
  agreement: string;
  file: string;
  fundingRequestId: string;
  users: string[];
};

const createDonationAgreement = async (donation: DonationAgreement) => {
  const session = await auth();
  const agreementData = await prisma.$transaction(async (prisma) => {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: donation?.users as string[],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const file = await prisma.file.create({
      data: {
        url: donation.file as string,
        type: "DONATION_AGREEMENT",
        createdBy: {
          connect: { id: session?.user?.userId as string },
        },
        updatedBy: { connect: { id: session?.user?.userId as string } },
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
        createdBy: { connect: { id: session?.user?.userId as string } },
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
      select: {
        id: true,
        team: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
        fundingRequest: {
          select: {
            name: true,
          },
        },
        file: {
          select: {
            id: true,
          },
        },
      },
    });

    const agreementsToSignByUser = users.map((user) => ({
      donationAgreementId: agreement.id,
      userId: user.id,
    }));

    await prisma.donationAgreementSignature.createMany({
      data: agreementsToSignByUser,
    });

    await prisma.fundingRequest.update({
      where: {
        id: donation?.fundingRequestId,
      },
      data: {
        status: "Processing",
      },
    });

    return { agreement, users };
  });

  return {
    agreement: agreementData.agreement,
    users: agreementData.users,
  };
};

const getDonationAgreements = async (
  { teamId, orgId }: { teamId: string; orgId: string },
  searchQuery: string
) => {
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
      userSignatures: {
        select: {
          user: {
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return donationAgreements;
};

const getDonationAgreementById = async (id: string) => {
  const donationAgreement = await prisma.donationAgreement.findUnique({
    where: {
      id,
    },
    include: {
      userSignatures: {
        select: {
          user: {
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
};

const updateDonationAgreement = async (
  id: string,
  updatedDonationAgreement: DonationAgreement
) => {
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
        updatedBy: { connect: { id: session?.user?.userId as string } },
      },
    });
    await prisma.donationAgreementSignature.update({
      where: {
        donationAgreementId_userId: {
          donationAgreementId: id,
          userId: session?.user?.userId as string,
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
};

const getDonationAgreementPastSevenDays = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0); // Start of the day

  const nextDay = new Date(sevenDaysAgo);
  nextDay.setDate(nextDay.getDate() + 1); // Next day (exclusive upper bound)

  const donationAgreements = await prisma.donationAgreement.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo, // 7 days ago, 00:00:00
        lt: nextDay, // 6 days ago, 00:00:00 (exclusive)
      },
    },
    select: {
      id: true,
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      fundingRequest: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return donationAgreements;
};

const getDonationAgreementPastEightWeeks = async () => {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  eightWeeksAgo.setHours(0, 0, 0, 0); // Start of the day

  const nextDay = new Date(eightWeeksAgo);
  nextDay.setDate(nextDay.getDate() + 1); // Next day (exclusive upper bound)

  const donationAgreements = await prisma.donationAgreement.findMany({
    where: {
      createdAt: {
        gte: eightWeeksAgo, // 56 days ago, 00:00:00
        lt: nextDay, // 55 days ago, 00:00:00 (exclusive)
      },
    },
    select: {
      id: true,
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      fundingRequest: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return donationAgreements;
};
export {
  createDonationAgreement,
  updateDonationAgreement,
  getDonationAgreements,
  getDonationAgreementById,
  getDonationAgreementPastEightWeeks,
  getDonationAgreementPastSevenDays,
};
