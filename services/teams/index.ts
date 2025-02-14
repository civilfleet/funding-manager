import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";

const getTeamsByRoles = async (roles: string[] | null) => {
  try {
    return await prisma.teams.findMany({
      where: {
        roleName: { in: roles || [] },
      },
      select: {
        id: true,
        name: true,
        roleName: true,
        email: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to get teams");
  }
};

const createTeam = async (teamData: any) => {
  try {
    console.log(teamData, "teamData in service ");

    const contact = teamData.contactPerson;
    const bankDetails = teamData.bankDetails;

    delete teamData.contactPerson;
    delete teamData.bankDetails;

    const team = await prisma.teams.create({
      data: {
        ...teamData,
        contactPersons: {
          create: {
            ...contact,
            type: "Team",
          },
        },
        bankDetails: {
          create: {
            ...bankDetails,
          },
        },
      },
    });
    console.log(team, "team in service");
    return {
      message: "Team created successfully",
    };
  } catch (error) {
    return handlePrismaError(error);
  }
};

export { getTeamsByRoles, createTeam };
