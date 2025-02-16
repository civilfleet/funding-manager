import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getErrorMessage } from "../../helpers";
import {
  getFundingRequestById,
  updateFundingRequest,
} from "@/services/funding-request";
import { updateFundingRequestSchema } from "@/validations/funding-request";

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
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
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

      await updateFundingRequest(fundingRequestId, validatedData);
      return NextResponse.json(
        {
          message: "success",
        },
        { status: 201 }
      );
    }
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
