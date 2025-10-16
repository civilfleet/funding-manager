import { notFound } from "next/navigation";
import { Roles, AppModule } from "@/types";
import { getUserModuleAccess } from "@/services/groups";

interface TeamModuleAccessArgs {
  teamId: string;
  userId?: string;
  roles?: Roles[];
}

export const assertTeamModuleAccess = async (
  { teamId, userId, roles }: TeamModuleAccessArgs,
  module: AppModule
) => {
  if (!userId) {
    notFound();
  }

  if (roles?.includes(Roles.Admin)) {
    return;
  }

  const modules = await getUserModuleAccess(userId!, teamId);

  if (!modules.includes(module)) {
    notFound();
  }
};

export const hasModuleAccess = async (
  { teamId, userId, roles }: TeamModuleAccessArgs,
  module: AppModule
): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  if (roles?.includes(Roles.Admin)) {
    return true;
  }

  const modules = await getUserModuleAccess(userId, teamId);
  return modules.includes(module);
};
