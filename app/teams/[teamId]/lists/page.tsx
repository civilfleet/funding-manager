import ContactListsManager from "@/components/forms/contact-lists-manager";

export default async function ContactListsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contact Lists</h1>
        <p className="text-muted-foreground mt-2">
          Organize your contacts into lists for better management and targeted
          communications.
        </p>
      </div>

      <ContactListsManager teamId={teamId} />
    </div>
  );
}
