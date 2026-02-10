import { redirect } from "next/navigation";
import { auth } from "@/auth";
import GroupsManager from "@/components/forms/groups-manager";
import prisma from "@/lib/prisma";
import { getTeamAdminAccess } from "@/services/teams/access";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user?.userId) {
    return redirect("/login");
  }

  const access = await getTeamAdminAccess(
    session.user.userId,
    teamId,
    session.user.roles,
  );
  if (!access.allowed) {
    return redirect(`/teams/${teamId}`);
  }

  const team = await prisma.teams.findUnique({
    where: { id: teamId },
    select: { modules: true },
  });

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground mt-2">
          Manage groups to control which users can access specific contacts
        </p>
      </div>
      <GroupsManager teamId={teamId} teamModules={team?.modules ?? undefined} />
    </div>
  );
}
