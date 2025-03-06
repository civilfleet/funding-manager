import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  getFundingRequestById,
  updateFundingRequest,
} from "@/services/funding-request";
import { updateFundingRequestSchema } from "@/validations/funding-request";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";

// ✅ GET Organization by ID
export async function GET(
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await getFundingRequestById(fundingRequestId);

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const session = await auth();
    if (session?.user.teamId) {
      const fundingRequest = await req.json();

      const validatedData = updateFundingRequestSchema.parse({
        ...fundingRequest,
      });

      const response = await updateFundingRequest(
        fundingRequestId,
        validatedData
      );
      sendEmail(
        {
          to: response?.organization?.email as string,
          subject: `Funding Request Status Updated`,
          template: "funding-status-update",
        },
        {
          organizationName: response?.organization?.name,

          requestName: response?.name,
          submittedDate: response?.createdAt,
          status: response.status,

          requestLink: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/funding-request/${response?.id}`,
          supportEmail: "support@partnerapp.com",
          teamName: response?.organization?.team?.name,
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
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}
