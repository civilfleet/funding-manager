import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Building,
  BookOpen,
  Scroll,
  BookUser,
  FolderOpen,
} from "lucide-react";
import { redirect } from "next/navigation";

const navigationItems = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  items: [
    {
      title: "Organizations",
      url: "/team/organization",
      icon: Building,
      isActive: true,
    },
    {
      title: "Funding Requests",
      url: "/team/funding-request",
      icon: BookOpen,
    },
    {
      title: "Donation Agreements",
      url: "/team/donation-agreement",
      icon: Scroll,
    },

    {
      title: "Users",
      url: "/team/users",
      icon: BookUser,
    },
    {
      title: "Files",
      url: "/team/file",
      icon: FolderOpen,
    },
  ],

  projects: [],
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = auth();
  if (!session) return redirect("/login");

  return (
    <div>
      <SidebarProvider>
        <AppSidebar navItems={navigationItems} />
        <SidebarInset>
          <div className="">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
