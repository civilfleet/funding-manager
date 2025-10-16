import { Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar navItems={"admin"} />
        <SidebarInset>
          <div className="flex items-center gap-2 p-4 border-b">
            <Shield className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
