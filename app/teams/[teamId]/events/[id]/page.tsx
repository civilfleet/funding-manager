import EventForm from "@/components/forms/event";
import { getEventById } from "@/services/events";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ teamId: string; id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { teamId, id } = await params;

  const event = await getEventById(id, teamId);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <EventForm teamId={teamId} event={event} />
      </div>
    </div>
  );
}
