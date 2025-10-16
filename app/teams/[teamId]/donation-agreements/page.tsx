import Link from "next/link";
import { auth } from "@/auth";
import DonationAgreementTable from "@/components/table/donation-agreement-table";
import { Button } from "@/components/ui/button";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Organization({ params }: PageProps) {
  const teamId = (await params).teamId;

  const session = await auth();
  await assertTeamModuleAccess(
    {
      teamId,
      userId: session?.user?.userId,
      roles: session?.user?.roles,
    },
    "FUNDING" satisfies AppModule,
  );

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Donations Agreements</h1>
        <Link href="donation-agreements/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
      <DonationAgreementTable teamId={teamId} organizationId="" />
    </div>
  );
}
