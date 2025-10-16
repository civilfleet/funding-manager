import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handlePrismaError } from "@/lib/utils";
import { getAdminUser, getUserCurrent } from "@/services/users";
import { Roles } from "@/types";

export async function GET() {
  try {
    let data;
    const session = await auth();
    if (session?.user?.roles?.includes(Roles.Admin)) {
      data = await getAdminUser(session?.user?.userId as string);
    } else {
      data = await getUserCurrent(session?.user?.userId as string);
    }

    return NextResponse.json(
      {
        data,
      },
      { status: 201 },
    );
  } catch (e) {
    const errorMessage = handlePrismaError(e);
    return NextResponse.json(
      { error: errorMessage?.message },
      { status: 400, statusText: errorMessage?.message },
    );
  }
}
