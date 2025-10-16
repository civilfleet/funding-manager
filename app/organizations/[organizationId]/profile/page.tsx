import OrganizationData from "@/components/data-components/organization";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const id = (await params).organizationId as string;

  return (
    <div>
      <div className="container">
        <OrganizationData organizationId={id} />
      </div>
    </div>
  );
}
