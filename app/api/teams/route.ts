import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.teams.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: teams });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, postalCode, city, country, website } = body;

    const team = await prisma.teams.create({
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
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
