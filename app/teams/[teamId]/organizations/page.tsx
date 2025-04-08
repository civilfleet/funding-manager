import OrganizationTable from "@/components/table/organization-table";
import { Button } from "@/components/ui/button";
import { CopyRegistrationLinkButton } from "@/components/buttons/copy-registration-link-button";
import Link from "next/link";

export default async function Organization({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl my-2">Organizations</h1>
        <div className="flex gap-2">
          <CopyRegistrationLinkButton teamId={teamId} />
          <Link href="organizations/create">
            <Button type="button">Create New</Button>
          </Link>
        </div>
      </div>
      <OrganizationTable />
    </div>
  );
}
