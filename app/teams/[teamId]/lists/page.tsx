import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ContactListsManager from "@/components/forms/contact-lists-manager";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function ContactListsPage({
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
    <div className="p-4">
      <ContactListsManager teamId={teamId} />
    </div>
  );
}
