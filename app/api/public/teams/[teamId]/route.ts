import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";

type RouteContext = {
  params: {
    teamId: string;
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  try {
    const team = await prisma.teams.findUnique({
      where: {
        id: teamId,
      },
      select: {
        name: true,
        strategicPriorities: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message },
    );
  }
}
