"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import {
  AudioWaveform,
  BookOpen,
  BookUser,
  Building,
  Command,
  FolderOpen,
  GalleryVerticalEnd,
  Scroll,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

// This is sample data.
const data = {
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
    // {
    //   title: "Teams",
    //   url: "/admin/teams",
    //   icon: Building,
    // },
    // {
    //   title: "Organizations",
    //   url: "/admin/organizations",
    //   icon: Building,
    // },
    // {
    //   title: "Users",
    //   url: "/admin/users",
    //   icon: BookUser,
    // },
    // {
    //   title: "Files",
    //   url: "/admin/files",
    //   icon: FolderOpen,
    // },
  ],

  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [items, setItems] = useState([]);
  const pathname = usePathname();
  const isOrganization = pathname.startsWith("/organization");
  const isAdmin = pathname.startsWith("/admin");
  const { data: session } = useSession();
  const [isTeamsMember, setIsTeamsMember] = useState(false);

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetch(`/api/user/current`);
        const {
          data: { teams, organizations },
        } = await response.json();
        if (teams?.length) {
          setItems(teams);
          setIsTeamsMember(true);
        } else if (organizations?.length) {
          setItems(organizations);
          setIsTeamsMember(false);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);

        throw new Error("Failed to fetch teams");
      }
    };

    getItems();
  }, []);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher items={items} isTeamsMember={isTeamsMember} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={
            isAdmin
              ? data.adminNav
              : isOrganization
              ? data.organizationNav
              : data.teamNav
          }
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name || data.user.name,
            email: session?.user?.email || data.user.email,
            image: session?.user?.image || data.user.avatar,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
