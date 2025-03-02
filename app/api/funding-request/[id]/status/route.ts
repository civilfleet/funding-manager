import { auth } from "@/auth";
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const session = await auth();
    if (session?.user.teamId) {
      const fundingRequest = await req.json();
      console.log("fundingRequestId===========", fundingRequest);

      await updateFundingRequestStatus(
        fundingRequestId,
        fundingRequest.status,
        fundingRequest.donationId
      );
      return NextResponse.json(
        {
          message: "success",
        },
        { status: 201 }
      );
    }
  } catch (e) {
    console.log("error", e);
    return NextResponse.json({ error: e }, { status: 400 });
  }
}
