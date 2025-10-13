import Link from "next/link";

import EventTable from "@/components/table/event-table";
import { Button } from "@/components/ui/button";

interface EventsPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { teamId } = await params;

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
