import ContactForm from "@/components/forms/contact";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface CreateContactPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function CreateContactPage({ params }: CreateContactPageProps) {
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
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <ContactForm teamId={teamId} />
      </div>
    </div>
  );
}
