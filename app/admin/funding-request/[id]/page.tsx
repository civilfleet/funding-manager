import FundingRequestDetails from "@/components/funding-request-details";
import { redirect } from "next/navigation";

export default async function FundingRequest({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const fundingRequests = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/funding-request/${id}`
  );
  const { data: fundingRequestsData } = await fundingRequests.json();
  if (!fundingRequestsData) {
    redirect("/admin/organization");
  }

  return (
    <div>
      <div className="container p-8">
        <FundingRequestDetails data={fundingRequestsData} />
      </div>
    </div>
  );
}
