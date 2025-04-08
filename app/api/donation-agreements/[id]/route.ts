import { NextResponse } from "next/server";
import { getDonationAgreementById, updateDonationAgreement } from "@/services/donation-agreement";
import { handlePrismaError } from "@/lib/utils";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const donationAgreementId = (await params).id;
    const data = await getDonationAgreementById(donationAgreementId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const donationAgreementId = (await params).id;

    const updatedDonationAgreement = await req.json();
    const session = await auth();

    await updateDonationAgreement(donationAgreementId, updatedDonationAgreement, session?.user.userId as string);
    return NextResponse.json({ data: "" }, { status: 200 });
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}
