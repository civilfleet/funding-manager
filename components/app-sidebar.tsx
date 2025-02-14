"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTeamStore } from "@/store/store";
import { usePathname } from "next/navigation";

import {
  AudioWaveform,
  BookOpen,
  BookUser,
  Bot,
  Building,
  ClipboardPlus,
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
      name: "Funding Manager",
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
      title: "Donation Agreements",
      url: "/team/donations-agreement",
      icon: Scroll,
    },
    {
      title: "Funding Requests",
      url: "/team/funding-request",
      icon: BookOpen,
    },
    {
      title: "Reports",
      url: "/team/report",
      icon: ClipboardPlus,
    },
    {
      title: "Contacts",
      url: "/team/contact",
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
      title: "Donation Agreement",
      url: "/organization/donations-agreement",
      icon: Scroll,
    },

    {
      title: "Funding Requests",
      url: "/organization/funding-request",
      icon: BookOpen,
    },
    {
      title: "Reports",
      url: "/organization/report",
      icon: ClipboardPlus,
    },
    {
      title: "Contacts",
      url: "/organization/contact",
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
    {
      title: "Teams",
      url: "/admin/teams",
      icon: Building,
    },
    // {
    //   title: "Organizations",
    //   url: "/admin/organizations",
    //   icon: Building,
    // },
    {
      title: "Contacts",
      url: "/admin/contacts",
      icon: BookUser,
    },
    // {
    //   title: "Files",
    //   url: "/admin/files",
    //   icon: FolderOpen,
    // },
  ],

  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [teams, setTeams] = useState([]);
  const pathname = usePathname();
  const isOrganization = pathname.startsWith("/organization");
  const isAdmin = pathname.startsWith("/admin");

  const { data: session, status } = useSession();

  const { setTeam } = useTeamStore();
  const isTeamsMember = teams?.length > 0;

  useEffect(() => {
    const getTeamsByRoles = async () => {
      try {
        const roles = session?.user?.roles;
        const query = roles?.map((role) => `roles=${role}`).join("&");

        const response = await fetch(`/api/teams?${query}`);
        const { teams } = await response.json();
        if (teams?.length) {
          setTeams(teams);
          // useTeamStore for global state
          setTeam({
            id: teams[0]?.id,
            name: teams[0]?.name,
            roleName: teams[0]?.roleName,
            email: teams[0]?.email,
          });
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        throw new Error("Failed to fetch teams");
      }
    };
    if (status == "authenticated") getTeamsByRoles();
  }, [status]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isOrganization ? (
          <div className="flex items-center justify-center">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground m-1">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Funding Manager</span>
            </div>
          </div>
        ) : (
          <TeamSwitcher teams={teams} />
        )}
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
          isTeamsMember={isTeamsMember}
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
