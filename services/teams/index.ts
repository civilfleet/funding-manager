import prisma from "@/lib/prisma";

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
    const contact = teamData.contactPerson;
    const bankDetails = teamData.bankDetails;

    delete teamData.contactPerson;
    delete teamData.bankDetails;
    const query = {
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
    };

    const contactPerson = await prisma.contactPerson.findUnique({
      where: {
        email: contact.email,
      },
    });
    if (contactPerson?.id) {
      query.data.contactPersons = {
        connect: {
          id: contactPerson?.id,
        },
      };
    }

    const team = await prisma.teams.create(query);
    return {
      data: team,
    };
  } catch (error) {
    throw error;
  }
};

export { getTeamsByRoles, createTeam };
