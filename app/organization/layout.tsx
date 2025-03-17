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

const navigationItems = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Partner App",
      logo: GalleryVerticalEnd,
      plan: "Non-profit",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  teamNav: [
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
  organizationNav: [
    {
      title: "Organization",
      url: "/organization",
      icon: Building,
      isActive: true,
    },

    {
      title: "Funding Requests",
      url: "/organization/funding-request",
      icon: BookOpen,
    },
    {
      title: "Donation Agreement",
      url: "/organization/donation-agreement",
      icon: Scroll,
    },

    {
      title: "Users",
      url: "/organization/users",
      icon: BookUser,
    },
    {
      title: "Files",
      url: "/organization/file",
      icon: FolderOpen,
    },
  ],
  adminNav: [
    {
      title: "Admin",
      url: "/admin",
      icon: Building,
    },
  ],

  projects: [],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-8 pt-0 m-5">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
