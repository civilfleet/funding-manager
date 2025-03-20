import prisma from "@/lib/prisma";
import { Roles } from "@/types";
import { CreateTeamInput } from "@/validations/team";
import _, { update } from "lodash";

const getTeamsByRoles = async (roles: string[] | null) => {
  return await prisma.teams.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

const createTeam = async (teamData: CreateTeamInput) => {
  const TeamUser = teamData.user;
  const bankDetails = teamData.bankDetails;

  const sanitizedTeamData = _.omit(teamData, ["user", "bankDetails"]);

  const query = {
    data: {
      ...sanitizedTeamData,
      users: {},
      bankDetails: {
        create: {
          ...bankDetails,
        },
      },
    },
    select: {
      id: true,
      name: true,
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
  // TODO: Check if user already exists

  const user = await prisma.user.findUnique({
    where: {
      email: TeamUser.email,
    },
  });

  if (user?.id) {
    query.data.users = {
      connect: {
        id: user.id,
      },
    };
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        roles: {
          set: Array.from(new Set([...user.roles, Roles.Team])),
        },
      },
    });
  } else {
    query.data.users = {
      create: {
        ...TeamUser,
        roles: [Roles.Team] as Roles[],
      },
    };
  }

  const team = await prisma.teams.create(query);
  return {
    team,
  };
};

export { getTeamsByRoles, createTeam };
