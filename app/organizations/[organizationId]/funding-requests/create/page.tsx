import FundingRequest from "@/components/forms/funding-request";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const id = (await params).organizationId as string;
  return (
    <div className="flex flex-col w-2/3 p-4">
      <FundingRequest organizationId={id} />
    </div>
  );
}
