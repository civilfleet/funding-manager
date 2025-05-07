import OrganizationData from "@/components/data-components/organization";

export default async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  return (
    <div>
      <div className="container">
        <OrganizationData organizationId={id} />
      </div>
    </div>
  );
}
