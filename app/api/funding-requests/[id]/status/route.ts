import { sendEmail } from "@/lib/nodemailer";
import { handlePrismaError } from "@/lib/utils";
import { updateFundingRequestStatus } from "@/services/funding-request";
import { NextResponse } from "next/server";

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

    const fundingRequestData = await req.json();
    const teamId = fundingRequestData?.teamId;
    if (teamId) {
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

          requestLink: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/funding-requests/${fundingRequest?.id}`,
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
