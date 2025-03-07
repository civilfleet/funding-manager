import { NextResponse } from "next/server";

import { handlePrismaError } from "@/lib/utils";
import { createDonationAgreementSchema } from "@/validations/donation-agreement";
import {
  createDonationAgreement,
  getDonationAgreements,
} from "@/services/donation-agreement";
import { omit } from "lodash";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const orgId = session?.user?.organizationId as string;
    const teamId = session?.user?.teamId as string;

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
    const donationAgreement = await req.json();

    const validatedData =
      createDonationAgreementSchema.parse(donationAgreement);

    const { agreement, contacts } = await createDonationAgreement({
      ...omit(validatedData, "contactPerson"),
      contactPersons: validatedData.contactPersons ?? [],
    });

    contacts?.forEach(async (contact) => {
      await sendEmail(
        {
          to: contact.email,
          subject: "Donation Agreement",
          template: "donation-agreement",
        },
        {
          contactPerson: contact.name,
          requestName: agreement.fundingRequest.name,
          organizationName: agreement?.organization?.name,
          agreementLink: `${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${agreement.file.id}`,
          supportEmail: agreement?.team?.email,
          teamName: agreement?.team?.name,
        }
      );
    });

    return NextResponse.json(
      {
        message: "Donation agreement created successfully",
      },
      { status: 201 }
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}
