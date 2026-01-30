import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roles } from "@/types";

export async function GET() {
  try {
    const teams = await prisma.teams.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: teams });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      postalCode,
      city,
      country,
      website,
      user,
    } = body;

    // Use transaction to handle team creation with user
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.teams.create({
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
        include: {
          users: true,
        },
      });

      // Create or connect user if provided
      if (user) {
        // Check if user already exists with this email
        const existingUser = await tx.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Connect existing user to team and add Team role if not already present
          const updatedRoles = Array.from(
            new Set([...existingUser.roles, Roles.Team]),
          );
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              roles: updatedRoles,
              teams: {
                connect: { id: newTeam.id },
              },
            },
          });
        } else {
          // Create new user and connect to team
          await tx.user.create({
            data: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              roles: [Roles.Team],
              teams: {
                connect: { id: newTeam.id },
              },
            },
          });
        }
      }

      return newTeam;
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
