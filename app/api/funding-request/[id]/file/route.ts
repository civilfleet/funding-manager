import { auth } from "@/auth";
import { uploadFundingRequestFile } from "@/services/funding-request";
import { FileTypes } from "@/types";
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
    const data = await req.json();

    await uploadFundingRequestFile(
      fundingRequestId,
      data.file,
      data?.type as FileTypes,
      session?.user?.contactId as string
    );

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 201 }
    );
  } catch (e) {
    console.log("error", e);
    return NextResponse.json({ error: e }, { status: 400 });
  }
}
