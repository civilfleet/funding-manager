import TransactionTable from "@/components/table/transaction-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    teamId: string;
    organizationId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId, organizationId } = await params;

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Transactions</h1>
        <Link href="transactions/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
      <TransactionTable teamId={teamId} organizationId={organizationId} />
    </div>
  );
}
