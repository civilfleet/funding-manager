import FundingRequestData from "@/components/data-components/funding-request";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function FundingRequest({ params }: { params: Promise<{ id: string; teamId: string }> }) {
  const id = (await params).id;
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
    <div>
      <div className="container p-8">
        <FundingRequestData fundingRequestId={id} teamId={teamId} />
      </div>
    </div>
  );
}
