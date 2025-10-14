import GroupsManager from "@/components/forms/groups-manager";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground mt-2">
          Manage groups to control which users can access specific contacts
        </p>
      </div>
      <GroupsManager teamId={teamId} />
    </div>
  );
}
