import { NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/utils";
import { getContactPersonCurrent } from "@/services/contact-person";

export async function GET(req: Request) {
  try {
    const data = await getContactPersonCurrent();

    return NextResponse.json(
      {
        data,
      },
      { status: 201 }
    );
  } catch (e) {
    const errorMessage = handlePrismaError(e);
    return NextResponse.json(
      { error: errorMessage?.message },
      { status: 400, statusText: errorMessage?.message }
    );
  }
}
