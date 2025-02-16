import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";

// ✅ GET Organization by ID
export async function PUT() {
  try {
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
