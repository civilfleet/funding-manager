import CreateTransaction from "@/components/forms/modal/create-transaction";
import TransactionTable from "@/components/table/transaction-table";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface PageProps {
  params: Promise<{
    teamId: string;
    organizationId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId, organizationId } = await params;

  const session = await auth();
  await assertTeamModuleAccess(
    {
      teamId,
      userId: session?.user?.userId,
      roles: session?.user?.roles,
    },
    "FUNDING" satisfies AppModule
  );

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Transactions</h1>
        <CreateTransaction teamId={teamId} />
      </div>
      <TransactionTable teamId={teamId} organizationId={organizationId} />
    </div>
  );
}
