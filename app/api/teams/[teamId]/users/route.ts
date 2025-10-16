import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;

    const users = await prisma.user.findMany({
      where: {
        teams: {
          some: {
            id: teamId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team users:", error);
    return NextResponse.json(
      { error: "Failed to fetch team users" },
      { status: 500 },
    );
  }
}
