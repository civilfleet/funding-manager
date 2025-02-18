import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import { handlePrismaError } from "@/lib/utils";
import { auth } from "@/auth";
import { getFiles } from "@/services/file";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";

    const data = await getFiles(
      {
        organizationId: session?.user?.organizationId as string,
        teamId: session?.user?.teamId as string,
      },
      searchQuery
    );

    return NextResponse.json(
      { data },

      { status: 201 }
    );
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json(
      { error: handledError?.message },
      { status: 400, statusText: handledError?.message }
    );
  }
}

export async function PUT() {
  try {
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 400 });
  }
}
