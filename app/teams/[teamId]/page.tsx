import RecentActivity from "@/components/recent-activity";
import prisma from "@/lib/prisma";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  const team = await prisma.teams.findUnique({
    where: { id: teamId },
    select: { name: true },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          {team?.name || "Team"} Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Jump into your team tools from the sidebar or review the latest activity below.
        </p>
      </div>
      <div className="rounded-lg border bg-background p-4">
        <RecentActivity scope="team" scopeId={teamId} title="Team Activity" />
      </div>
    </div>
  );
}
