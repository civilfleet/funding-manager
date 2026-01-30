import { ContactListDetail } from "@/components/forms/contact-list-detail";

export default async function NewContactListPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="container mx-auto py-8">
      <ContactListDetail teamId={teamId} listId="new" />
    </div>
  );
}
