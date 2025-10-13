import { notFound } from "next/navigation";
import { getContactById } from "@/services/contacts";
import ContactForm from "@/components/forms/contact";

interface EditContactPageProps {
  params: Promise<{
    teamId: string;
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { teamId, id } = await params;
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
