import Link from "next/link";

import EventTable from "@/components/table/event-table";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface EventsPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { teamId } = await params;

  const session = await auth();
  await assertTeamModuleAccess(
    {
      teamId,
      userId: session?.user?.userId,
      roles: session?.user?.roles,
    },
    "CRM" satisfies AppModule
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage events and track contact participation for your team.
          </p>
        </div>
        <Link href="events/create">
          <Button type="button">Add event</Button>
        </Link>
      </div>

      <EventTable teamId={teamId} />
    </div>
  );
}
