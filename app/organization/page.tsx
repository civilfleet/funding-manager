import { auth } from "@/auth";
import OrganizationForm from "@/components/forms/organization";
import OrganizationDetails from "@/components/organization-details";

export default async function Page() {
  // get organization data
  const session = await auth();

  const orgId = session?.user?.organizationId;
  const organization = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organization/${orgId}`
  );

  const fundingRequests = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/funding-request`
  );

  const { data: fundingRequestsData } = await fundingRequests.json();

  const { data } = await organization.json();
  return (
    <div>
      {data.isFilledByOrg ? (
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
