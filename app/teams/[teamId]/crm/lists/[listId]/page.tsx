import { ContactListDetail } from "@/components/forms/contact-list-detail";

export default async function ContactListDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; listId: string }>;
}) {
  const { teamId, listId } = await params;

  return (
    <div className="container mx-auto py-8">
      <ContactListDetail teamId={teamId} listId={listId} />
    </div>
  );
}
