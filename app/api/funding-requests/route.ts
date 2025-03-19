import { NextResponse } from "next/server";
import {
  createFundingRequest,
  getFundingRequests,
} from "@/services/funding-request";
import { createFundingRequestSchema } from "@/validations/funding-request";
import { z } from "zod";
import { auth } from "@/auth";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const session = await auth();

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const status = searchParams.getAll("status") || [];
    const orgId = searchParams.get("organizationId") as string;

    const teamId = session?.user?.teamId as string;

    const data = await getFundingRequests(
      { teamId, orgId },
      searchQuery,
      status
    );

    return NextResponse.json(
      {
        data,
      },
      { status: 201 }
    );
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message }
    );
  }
}

export async function POST(req: Request) {
  try {
    const fundingRequestData = await req.json();
    const validatedData = createFundingRequestSchema
      .and(
        z.object({
          organizationId: z.string().uuid(),
          submittedBy: z.string().email().optional().or(z.literal("")),
        })
      )
      .parse(fundingRequestData);

    const { fundingRequest, user, organization } = await createFundingRequest(
      validatedData
    );

    sendEmail(
      {
        to: organization.team?.email as string,
        subject: `New Funding Request from ${organization.name}`,
        template: "new-funding-request",
      },
      {
        teamEmail: organization.team?.email as string,
        organizationName: organization.name,
        user: user?.name || "Unknown",
        userEmail: user.email || "Unknown",
        fundingAmount: fundingRequest.amountRequested,
        fundingPurpose: fundingRequest.purpose,
        fundingRequestLink: `${process.env.NEXT_PUBLIC_BASE_URL}/team/funding-request/${fundingRequest.id}`,
      }
    );

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 201 }
    );
  } catch (e) {
    const { message } = handlePrismaError(e);

    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message }
    );
  }
}
