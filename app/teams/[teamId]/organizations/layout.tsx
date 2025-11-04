import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { auth } from "@/auth";
import { assertTeamModuleAccess } from "@/lib/permissions";

export default async function OrganizationsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ teamId: string }> }>) {
  const { teamId } = await params;
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  await assertTeamModuleAccess(
    {
      teamId,
      userId: session.user?.userId,
      roles: session.user?.roles,
    },
    "FUNDING",
  );

  return <>{children}</>;
}
