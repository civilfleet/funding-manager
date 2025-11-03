import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContactListDetail } from "@/components/forms/contact-list-detail";
import { hasModuleAccess } from "@/lib/permissions";
import { AppModule } from "@/types";

export default async function NewContactListPage({
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
    <div className="container mx-auto py-8">
      <ContactListDetail teamId={teamId} listId="new" />
    </div>
  );
}
