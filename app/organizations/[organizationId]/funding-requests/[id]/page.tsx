import FundingRequestData from "@/components/data-components/funding-request";

export default async function FundingRequest({ params }: { params: Promise<{ id: string; organizationId: string }> }) {
  const id = (await params).id;
  const organizationId = (await params).organizationId;

  const organization = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organizations/${organizationId}`);
  const { data: organizationData } = await organization.json();
  const teamId = organizationData?.teamId;

  return (
    <div>
      <div className="container p-8">
        <FundingRequestData fundingRequestId={id} teamId={teamId} />
      </div>
    </div>
  );
}
