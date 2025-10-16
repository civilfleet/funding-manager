import SignDonationAgreement from "@/components/forms/sign-donation-agreement";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function Page({ params }: { params: Promise<{ id: string; teamId: string }> }) {
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

  const donationAgreement = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/donation-agreements/${id}`);
  const { data: donationData } = await donationAgreement.json();
  if (!donationData) {
    // TODO - redirect to the correct page
    redirect("/team/organizations");
  }

  return (
    <div>
      <div className="container px-5 py-1">
        <SignDonationAgreement data={donationData} teamId={teamId} />
      </div>
    </div>
  );
}
