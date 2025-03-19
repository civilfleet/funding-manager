import FundingRequestData from "@/components/data-components/funding-request";

export default async function FundingRequest({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return (
    <div>
      <div className="container p-8">
        <FundingRequestData fundingRequestId={id} />
      </div>
    </div>
  );
}
