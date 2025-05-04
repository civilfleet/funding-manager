import { NextResponse } from "next/server";

import { handlePrismaError } from "@/lib/utils";
import { createDonationAgreementSchema } from "@/validations/donation-agreement";
import { createDonationAgreement, getDonationAgreements } from "@/services/donation-agreement";
import { omit } from "lodash";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const teamId = searchParams.get("teamId") as string;
    const orgId = searchParams.get("organizationId") as string;

    const data = await getDonationAgreements({ teamId, orgId }, searchQuery);

    return NextResponse.json(
      {
        data,
      },
      { status: 201 }
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const donationAgreement = await req.json();

    const validatedData = createDonationAgreementSchema.parse(donationAgreement);
    const { agreement, users } = await createDonationAgreement(
      {
        ...omit(validatedData, "user", "teamId"),
        users: validatedData.users ?? [],
      },
      session?.user.userId as string,
      donationAgreement?.teamId
    );

    users?.forEach(async (user) => {
      await sendEmail(
        {
          to: user.email,
          subject: "Donation Agreement",
          template: "donation-agreement",
        },
        {
          user: user.name,
          requestName: agreement.fundingRequest.name,
          organizationName: agreement?.organization?.name,
          agreementLink: `${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${agreement.file.id}`,
          supportEmail: agreement?.team?.email,
          teamName: agreement?.team?.name,
        }
      );
    });

    return NextResponse.json(
      {
        message: "Donation agreement created successfully",
        data: agreement,
      },
      { status: 201 }
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}
