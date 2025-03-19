import prisma from "@/lib/prisma";
import { Roles } from "@/types";
import { CreateTeamInput } from "@/validations/team";
import _ from "lodash";

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
  } else {
    query.data.users = {
      create: {
        ...TeamUser,
        roles: [Roles.Admin] as Roles[],
      },
    };
  }

  const team = await prisma.teams.create(query);
  return {
    team,
  };
};

export { getTeamsByRoles, createTeam };
