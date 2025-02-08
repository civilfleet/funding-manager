import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import {
  createFundingRequest,
  getFundingRequests,
  getFundingRequestsByOrgId,
} from "@/services/funding-request";
import { createFundingRequestSchema } from "@/validations/funding-request";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    let data;
    const { searchParams } = new URL(req.url);
    const orgId: string = searchParams.get("orgId") as string;
    if (orgId) {
      data = await getFundingRequestsByOrgId(orgId);
    } else {
      data = await getFundingRequests();
    }

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

    console.log("validatedData", validatedData);
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
