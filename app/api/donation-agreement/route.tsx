import { NextResponse } from "next/server";

import { handlePrismaError } from "@/lib/utils";
import { createDonationAgreement } from "@/validations/donation-agreement";

export async function POST(req: Request) {
  try {
    const donationAgreement = await req.json();
    console.log("Donation agreement data:", donationAgreement);

    const validatedData = createDonationAgreement.parse(donationAgreement);
    // await createDonationAgreement(validatedData);
    console.log("Donation agreement created successfully", validatedData);
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
