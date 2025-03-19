import { auth } from "@/auth";
import OrganizationForm from "@/components/forms/organization";
import OrganizationDetails from "@/components/organization-details";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  // get organization data
  const session = await auth();
  const id = (await params).organizationId as string;

  const organization = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizations/${id}`
  );

  const fundingRequests = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/funding-requests?organizationId=${id}`
  );

  const { data: fundingRequestsData } = await fundingRequests.json();

  const { data } = await organization.json();
  return (
    <div className="container px-5 py-1">
      {data?.isFilledByOrg ? (
        <OrganizationDetails
          organization={data}
          fundingRequests={fundingRequestsData}
        />
      ) : (
        <OrganizationForm data={data} />
      )}
    </div>
  );
}
