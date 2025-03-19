import { auth } from "@/auth";
import { sendEmail } from "@/lib/nodemailer";
import { handlePrismaError } from "@/lib/utils";
import { updateFundingRequestStatus } from "@/services/funding-request";
import { NextResponse } from "next/server";

// ✅ GET Organization by ID
export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const fundingRequestId = (await params).id;

    if (!fundingRequestId) {
      throw new Error("ID is required");
    }
    const session = await auth();
    if (session?.user.teamId) {
      const fundingRequestData = await req.json();

      const fundingRequest = await updateFundingRequestStatus(
        fundingRequestId,
        fundingRequestData.status,
        fundingRequestData?.donationId
      );

      sendEmail(
        {
          to: fundingRequest?.organization?.email as string,
          subject: `Funding Request Status Updated`,
          template: "funding-status-update",
        },
        {
          organizationName: fundingRequest?.organization?.name,

          requestName: fundingRequest?.name,
          submittedDate: fundingRequest?.createdAt,
          status: fundingRequestData.status,

          requestLink: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/funding-request/${fundingRequest?.id}`,
          supportEmail: "support@partnerapp.com",
          teamName: fundingRequest?.organization?.team?.name,
        }
      );

      return NextResponse.json(
        {
          message: "success",
        },
        { status: 201 }
      );
    }
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
