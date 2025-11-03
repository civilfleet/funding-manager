import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UserTable from "@/components/table/user-table";
import { Button } from "@/components/ui/button";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  const session = await auth();
  if (!session) {
    return redirect("/");
  }
  const canAccess = await hasModuleAccess(
    {
      teamId,
      userId: session.user?.userId,
      roles: session.user?.roles,
    },
    "CRM" satisfies AppModule,
  );

  if (!canAccess) {
    return redirect("/");
  }

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Users</h1>
        <Link href="users/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
      <UserTable teamId={teamId} organizationId="" />
    </div>
  );
}
