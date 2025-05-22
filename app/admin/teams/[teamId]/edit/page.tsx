import { auth } from "@/auth";
import { Roles } from "@/types";
import { redirect } from "next/navigation";
import TeamForm from "@/components/forms/team";
import prisma from "@/lib/prisma";

export default async function EditTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const session = await auth();
  const { teamId } = await params;

  if (!session?.user?.roles?.includes(Roles.Admin)) {
    return redirect("/");
  }
  const team = await prisma.teams.findUnique({
    where: {
      id: teamId,
    },
    include: {
      bankDetails: true,
      users: true,
    },
  });
  if (!team) {
    return redirect("/admin/teams");
  }
  return (
    <div className="m-2 w-full">
      <TeamForm team={team} />
    </div>
  );
}
