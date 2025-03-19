import OrganizationDetails from "@/components/organization-details";
import { redirect } from "next/navigation";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const organization = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizations/${id}`
  );

  const fundingRequests = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/funding-requests`
  );

  const { data: fundingRequestsData } = await fundingRequests.json();
  const { data } = await organization.json();

  if (!data) {
    redirect("/team/organization");
  }

  return (
    <div>
      <div className="container">
        <OrganizationDetails
          organization={data}
          fundingRequests={fundingRequestsData}
        />
      </div>
    </div>
  );
}
