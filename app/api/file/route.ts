import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";

// ✅ GET Organization by ID
export async function PUT(req: Request) {
  try {
    const fundingRequest = await req.json();
    console.log("fundingRequest", fundingRequest);
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
