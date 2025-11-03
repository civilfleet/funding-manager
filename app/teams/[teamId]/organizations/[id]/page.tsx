import OrganizationData from "@/components/data-components/organization";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id, teamId } = await params;

  return (
    <div>
      <div className="container">
        <OrganizationData organizationId={id} />
      </div>
    </div>
  );
}
