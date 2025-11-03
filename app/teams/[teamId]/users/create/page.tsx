import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UserForm from "@/components/forms/user";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
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
    <div className="flex flex-col w-2/3 p-4">
      <UserForm teamId={teamId} organizationId={""} />
    </div>
  );
}
