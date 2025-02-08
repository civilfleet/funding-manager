import { NextResponse } from "next/server";
import { getErrorMessage } from "../../helpers";
import { getFundingRequestById } from "@/services/funding-request";

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
