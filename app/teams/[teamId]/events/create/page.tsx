import { headers } from "next/headers";
import { auth } from "@/auth";
import EventForm from "@/components/forms/event";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface CreateEventPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function CreateEventPage({
  params,
}: CreateEventPageProps) {
  const { teamId } = await params;

  const headerList = await headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicBaseUrl = host ? `${protocol}://${host}` : fallbackBaseUrl;

  const session = await auth();
  await assertTeamModuleAccess(
    {
      teamId,
      userId: session?.user?.userId,
      roles: session?.user?.roles,
    },
    "CRM" satisfies AppModule,
  );

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <EventForm teamId={teamId} publicBaseUrl={publicBaseUrl} />
      </div>
    </div>
  );
}
