import prisma from "@/lib/prisma";

const getTeamsByRoles = async (roles: string[] | null) => {
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
};

const createTeam = async (teamData: any) => {
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
    select: {
      id: true,
      name: true,
      roleName: true,
      email: true,
      contactPersons: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
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
    team,
  };
};

export { getTeamsByRoles, createTeam };
