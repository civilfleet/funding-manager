import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAdminUser, getUserCurrent } from "@/services/users";
import { Roles } from "@/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) return redirect("/login");

  let userData;
  if (session?.user?.roles?.includes(Roles.Admin)) {
    userData = await getAdminUser(session?.user?.userId as string);
  } else {
    userData = await getUserCurrent(session?.user?.userId as string);
  }

  // Serialize data to ensure consistency between server and client
  const teams = userData?.teams
    ? JSON.parse(JSON.stringify(userData.teams))
    : [];
  const organizations = userData?.organizations
    ? JSON.parse(JSON.stringify(userData.organizations))
    : [];

  return (
    <div>
      <SidebarProvider>
        <AppSidebar
          navItems={"organization"}
          teams={teams}
          organizations={organizations}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-8 pt-0 m-5">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
