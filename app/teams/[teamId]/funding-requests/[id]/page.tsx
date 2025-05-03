import FundingRequestData from "@/components/data-components/funding-request";

export default async function FundingRequest({ params }: { params: Promise<{ id: string; teamId: string }> }) {
  const id = (await params).id;
  const teamId = (await params).teamId;

  return (
    <div>
      <div className="container p-8">
        <FundingRequestData fundingRequestId={id} teamId={teamId} />
      </div>
    </div>
  );
}
