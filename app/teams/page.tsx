import { auth } from "auth";
import { redirect } from "next/navigation";
import { getAdminUser, getUserCurrent } from "@/services/users";
import { Roles } from "@/types";

export default async function TeamsPage() {
  let data;
  const session = await auth();
  if (session?.user?.roles?.includes(Roles.Admin)) {
    data = await getAdminUser(session?.user?.userId as string);
  } else {
    data = await getUserCurrent(session?.user?.userId as string);
  }

  const { teams = [] } = data || {};

  if (teams?.length > 0) {
    return redirect(`/teams/${teams?.[0]?.id}`);
  }

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">
          Welcome to your Teams Page, please select a menu entry.
        </h1>
      </div>
    </div>
  );
}
