import OrganizationData from "@/components/data-components/organization";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function Profile({ params }: { params: Promise<{ id: string; teamId: string }> }) {
  const { id, teamId } = await params;

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
    <div>
      <div className="container">
        <OrganizationData organizationId={id} />
      </div>
    </div>
  );
}
