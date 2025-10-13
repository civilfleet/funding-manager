import EventForm from "@/components/forms/event";

interface CreateEventPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function CreateEventPage({ params }: CreateEventPageProps) {
  const { teamId } = await params;

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <EventForm teamId={teamId} />
      </div>
    </div>
  );
}
