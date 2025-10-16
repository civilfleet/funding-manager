import FileTable from "@/components/table/file-table";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";
interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}
export default async function Page({ params }: PageProps) {
  const teamId = (await params).teamId;

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
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Files</h1>
      </div>
      <FileTable teamId={teamId} organizationId="" />
    </div>
  );
}

