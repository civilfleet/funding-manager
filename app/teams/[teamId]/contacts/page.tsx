import Link from "next/link";
import ContactTable from "@/components/table/contact-table";
import { Button } from "@/components/ui/button";

interface ContactsPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const { teamId } = await params;

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage the relationships and key stakeholders associated with your
            team.
          </p>
        </div>
        <Link href="contacts/create">
          <Button type="button">Add contact</Button>
        </Link>
      </div>

      <ContactTable teamId={teamId} />
    </div>
  );
}
