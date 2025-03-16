import { NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/utils";
import { getUserCurrent } from "@/services/users";

export async function GET() {
  try {
    const data = await getUserCurrent();

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
