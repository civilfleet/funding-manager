import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const team = await prisma.teams.findUnique({
      where: {
        id: params.teamId,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, postalCode, city, country, website } = body;

    const team = await prisma.teams.update({
      where: {
        id: params.teamId,
      },
      data: {
        name,
        email,
        phone,
        address,
        postalCode,
        city,
        country,
        website,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    await prisma.teams.delete({
      where: {
        id: params.teamId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
} 