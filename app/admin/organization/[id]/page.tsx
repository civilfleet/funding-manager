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
  const { data } = await organization.json();
  if (!data) {
    redirect("/admin/organization");
  }

  return (
    <div>
      <div className="container mx-auto p-10">
        <OrganizationDetails organization={data} />
      </div>
    </div>
  );
}
