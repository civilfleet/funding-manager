import { NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/utils";
import { syncZammadIntegration } from "@/services/integrations/zammad";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const fullSyncParam = searchParams.get("fullSync");
    const fullSync =
      fullSyncParam === "1" ||
      fullSyncParam === "true" ||
      fullSyncParam === "yes";
    const result = await syncZammadIntegration(teamId, { fullSync });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
