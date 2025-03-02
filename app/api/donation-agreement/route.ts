import { NextResponse } from "next/server";

import { handlePrismaError } from "@/lib/utils";
import { createDonationAgreementSchema } from "@/validations/donation-agreement";
import {
  createDonationAgreement,
  getDonationAgreements,
} from "@/services/donation-agreement";
import { omit } from "lodash";
import { auth } from "@/auth";

// ✅ GET (Get Funding Requests)
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

    await createDonationAgreement({
      ...omit(validatedData, "contactPerson"),
      contactPersons: validatedData.contactPersons ?? [],
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
