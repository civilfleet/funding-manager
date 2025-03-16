import { NextResponse } from "next/server";
import { getTeamsUsers } from "@/services/users";
import { auth } from "@/auth";
import { handlePrismaError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    const response = await getTeamsUsers(session?.user.teamId as string);

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
