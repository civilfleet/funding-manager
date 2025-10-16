import DonationAgreement from "@/components/forms/donation-agreement";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

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
    <div className="flex flex-col p-4">
      <DonationAgreement teamId={teamId} />
    </div>
  );
}
