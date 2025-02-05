import { AppSidebar } from "@/components/app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              {/* <SidebarTrigger className="-ml-12 -mt-6" /> */}
              <h1
                className="
                text-4xl
             
              "
              >
                Funding Manager
              </h1>
            </div>
          </header>
          <div className="">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
