import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UserDetails from "@/components/user-details";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string; id: string }>;
}) {
  const { teamId, id } = await params;

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
    <div className="p-4 w-full">
      <UserDetails userId={id} />
    </div>
  );
}
