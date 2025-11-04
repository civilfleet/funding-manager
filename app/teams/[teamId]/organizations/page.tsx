import Link from "next/link";
import { CopyRegistrationLinkButton } from "@/components/buttons/copy-registration-link-button";
import OrganizationTable from "@/components/table/organization-table";
import { Button } from "@/components/ui/button";

export default async function Organization({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <div className="flex flex-wrap gap-2">
          <CopyRegistrationLinkButton teamId={teamId} />
          <Link href={`/teams/${teamId}/organizations/create`}>
            <Button type="button">Create New</Button>
          </Link>
        </div>
      </div>
      <OrganizationTable teamId={teamId} />
    </div>
  );
}
