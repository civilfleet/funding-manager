import { Building, DollarSign, Settings, Users } from "lucide-react";
import Link from "next/link";
import RecentActivity from "@/components/recent-activity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {team?.name || "Team"} Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href={`/teams/${teamId}/organizations`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Organizations
              </CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and manage your organizations
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/teams/${teamId}/funding-requests`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Funding Requests
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review and manage funding requests
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/teams/${teamId}/users`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Manage team members</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/teams/${teamId}/settings`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure team settings and forms
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <RecentActivity scope="team" scopeId={teamId} title="Team Activity" />
      </div>
    </div>
  );
}
