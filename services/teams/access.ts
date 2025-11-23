import { ensureTeamOwner } from "@/services/teams";
import { getUserModuleAccess } from "@/services/groups";
import { Roles } from "@/types";

export const getTeamAdminAccess = async (
  userId: string,
  teamId: string,
  roles?: Roles[] | string[],
) => {
  const isSuperAdmin = roles?.includes(Roles.Admin) ?? false;

  if (isSuperAdmin) {
    return {
      isOwner: false,
      isAdmin: true,
      allowed: true,
    };
  }

  const [modules, ownerId] = await Promise.all([
    getUserModuleAccess(userId, teamId),
    ensureTeamOwner(teamId),
  ]);

  const isOwner = ownerId === userId;
  const isAdmin = modules.includes("ADMIN");

  return {
    isOwner,
    isAdmin,
    allowed: isOwner || isAdmin,
  };
};
