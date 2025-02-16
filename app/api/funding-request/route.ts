import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import {
  createFundingRequest,
  getFundingRequests,
  getFundingRequestsByOrgId,
} from "@/services/funding-request";
import { createFundingRequestSchema } from "@/validations/funding-request";
import { z } from "zod";
import { auth } from "@/auth";

// ✅ GET (Get Funding Requests)
export async function GET(req: Request) {
  try {
    let data;
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const orgId = session?.user?.organizationId as string;
    const teamId = session?.user?.teamId as string;
    console.log("getting funding requests", orgId, teamId);
    data = await getFundingRequests({ teamId, orgId }, searchQuery);

    return NextResponse.json(
      {
        data,
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}

export async function POST(req: Request) {
  try {
    const fundingRequest = await req.json();
    const validatedData = createFundingRequestSchema
      .and(
        z.object({
          organizationId: z.string().uuid(),
          submittedBy: z.string().email().optional().or(z.literal("")),
        })
      )
      .parse({
        ...fundingRequest,
      });

    await createFundingRequest(validatedData);
    return NextResponse.json(
      {
        message: "success",
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}
