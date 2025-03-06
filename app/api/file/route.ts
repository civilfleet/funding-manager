import { NextResponse } from "next/server";
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
    const message = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
