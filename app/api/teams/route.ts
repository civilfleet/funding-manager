import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeLoginDomain } from "@/lib/auth-routing";
import { Roles } from "@/types";
import { createTeamSchema } from "@/validations/team";
import logger from "@/lib/logger";
import { ZodError } from "zod";

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
    const validatedData = createTeamSchema.parse(body);
    const {
      name,
      email,
      loginMethod,
      oidcIssuer,
      oidcClientId,
      oidcClientSecret,
      user,
      phone,
      address,
      postalCode,
      city,
      country,
      website,
    } = validatedData;
    const loginDomain = normalizeLoginDomain(validatedData.loginDomain);

    // Use transaction to handle team creation with user
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.teams.create({
        data: {
          name,
          email,
          loginMethod,
          loginDomain,
          oidcIssuer,
          oidcClientId,
          oidcClientSecret,
          phone,
          address,
          postalCode,
          city,
          country,
          website,
        } as any,
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 },
      );
    }
    logger.error({ error }, "Error creating team");
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
