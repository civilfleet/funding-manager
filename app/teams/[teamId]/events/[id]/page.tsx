import EventForm from "@/components/forms/event";
import { getEventById } from "@/services/events";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ teamId: string; id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { teamId, id } = await params;

  const event = await getEventById(id, teamId);

  const headerList = await headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicBaseUrl = host ? `${protocol}://${host}` : fallbackBaseUrl;

  if (!event) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <EventForm teamId={teamId} event={event} publicBaseUrl={publicBaseUrl} />
      </div>
    </div>
  );
}
