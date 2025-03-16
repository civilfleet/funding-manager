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
  const TeamUser = teamData.user;
  const bankDetails = teamData.bankDetails;

  delete teamData.user;
  delete teamData.bankDetails;
  const query = {
    data: {
      ...teamData,
      users: {
        create: {
          ...TeamUser,
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
      users: {
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

  const user = await prisma.user.findUnique({
    where: {
      email: TeamUser.email,
    },
  });
  if (user?.id) {
    query.data.users = {
      connect: {
        id: user?.id,
      },
    };
  }

  const team = await prisma.teams.create(query);
  return {
    team,
  };
};

export { getTeamsByRoles, createTeam };
