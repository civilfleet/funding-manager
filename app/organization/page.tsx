import { auth } from "@/auth";
import OrganizationForm from "@/components/forms/organization-form";

export default async function Page() {
  // get organization data
  const session = await auth();

  const email = session?.user?.email as string;
  const organization = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/organization?email=${encodeURIComponent(email)}`
  );
  const data = await organization.json();
  return (
    <div>
      <OrganizationForm data={data.data} />
    </div>
  );
}
