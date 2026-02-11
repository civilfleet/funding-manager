import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const team = await prisma.teams.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const {
      name,
      email,
      registrationPageLogoKey,
      phone,
      address,
      postalCode,
      city,
      country,
      website,
      strategicPriorities,
      bankDetails,
      user,
    } = body;

    // Start a transaction to handle all updates
    const team = await prisma.$transaction(async (tx) => {
      // Update bank details if provided
      let bankDetailsId: string | undefined;
      if (bankDetails) {
        const existingTeam = await tx.teams.findUnique({
          where: { id: teamId },
          select: { bankDetailsId: true },
        });

        if (existingTeam?.bankDetailsId) {
          // Update existing bank details
          await tx.bankDetails.update({
            where: { id: existingTeam.bankDetailsId },
            data: {
              bankName: bankDetails.bankName,
              accountHolder: bankDetails.accountHolder,
              iban: bankDetails.iban,
              bic: bankDetails.bic,
            },
          });
          bankDetailsId = existingTeam.bankDetailsId;
        } else {
          // Create new bank details
          const newBankDetails = await tx.bankDetails.create({
            data: {
              bankName: bankDetails.bankName,
              accountHolder: bankDetails.accountHolder,
              iban: bankDetails.iban,
              bic: bankDetails.bic,
            },
          });
          bankDetailsId = newBankDetails.id;
        }
      }

      // Update team information
      const updatedTeam = await tx.teams.update({
        where: {
          id: teamId,
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
          registrationPageLogoKey,
          strategicPriorities,
          bankDetailsId,
        },
        include: {
          bankDetails: true,
          users: true,
        },
      });

      // Update or create user if provided
      if (user) {
        const existingUser = await tx.user.findFirst({
          where: {
            teams: {
              some: {
                id: teamId,
              },
            },
          },
        });

        if (existingUser) {
          // Update existing user
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
            },
          });
        } else {
          // Create new user and connect to team
          const _newUser = await tx.user.create({
            data: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              roles: ["Team"],
              teams: {
                connect: { id: teamId },
              },
            },
          });
        }
      }

      return updatedTeam;
    });

    return NextResponse.json(team);
  } catch (error) {
    logger.error({ error }, "Error updating team");
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    await prisma.teams.delete({
      where: {
        id: teamId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}
