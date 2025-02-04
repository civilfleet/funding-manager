import { auth } from "@/auth";
import OrganizationForm from "@/components/forms/organization-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Page() {
  // get organization data
  const session = await auth();
  console.log(session, "session");

  const email = session?.user?.email as string;
  const organization = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/organization?email=${encodeURIComponent(email)}`
  );
  const data = await organization.json();
  console.log("Organization Data:", data);

  return (
    <div>
      <OrganizationForm data={data.data} />
    </div>
  );
}
