import { notFound } from "next/navigation";
import { getContactById } from "@/services/contacts";
import ContactForm from "@/components/forms/contact";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface EditContactPageProps {
  params: Promise<{
    teamId: string;
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { teamId, id } = await params;
  const session = await auth();
  await assertTeamModuleAccess(
    {
      teamId,
      userId: session?.user?.userId,
      roles: session?.user?.roles,
    },
    "CRM" satisfies AppModule
  );
  const contact = await getContactById(id, teamId);

  if (!contact) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-3xl">
        <ContactForm teamId={teamId} contact={contact} />
      </div>
    </div>
  );
}
