import OrganizationDetails from "@/components/organization-details";
import { redirect } from "next/navigation";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const organization = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organization/${id}`
  );
  const contacts = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/contact-person?orgId=${id}`
  );

  const fundingRequests = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/funding-request?orgId=${id}`
  );
  const { data: fundingRequestsData } = await fundingRequests.json();
  const { data: contactsData } = await contacts.json();
  const { data } = await organization.json();

  if (!data) {
    redirect("/admin/organization");
  }

  return (
    <div>
      <div className="container">
        <OrganizationDetails
          organization={data}
          contacts={contactsData}
          fundingRequests={fundingRequestsData}
        />
      </div>
    </div>
  );
}
