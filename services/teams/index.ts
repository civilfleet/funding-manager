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

export { getTeamsByRoles };
