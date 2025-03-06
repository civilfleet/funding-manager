import { NextResponse } from "next/server";
import { getTeamsContactPersons } from "@/services/contact-person";
import { auth } from "@/auth";
import { handlePrismaError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    const response = await getTeamsContactPersons(
      session?.user.teamId as string
    );

    return NextResponse.json(
      {
        data: response,
      },
      { status: 201 }
    );
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message }
    );
  }
}
