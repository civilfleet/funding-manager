"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTeamStore } from "@/store/store";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
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
  navMain: [
    {
      title: "Organizations",
      url: "/admin/organizations",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Donation Agreements",
      url: "/admin/donations-agreement",
      icon: Bot,
    },
    {
      title: "Funding Requests",
      url: "/admin/funding-requests",
      icon: BookOpen,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: Settings2,
    },
    {
      title: "Contacts",
      url: "/admin/contacts",
      icon: Settings2,
    },
    {
      title: "Files",
      url: "/admin/files",
      icon: Frame,
    },
  ],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [teams, setTeams] = useState<
    {
      name: string;
      logo: React.ElementType;
      plan: string;
    }[]
  >([]);

  const { setTeam } = useTeamStore();

  const isTeamsMember = teams?.length > 0;
  const { data: session, status } = useSession();

  useEffect(() => {
    const getTeamsByRoles = async () => {
      try {
        const roles = ["fm-admin", "fm-lnob"];
        const query = roles.map((role) => `roles=${role}`).join("&");
        const response = await fetch(`/api/teams?${query}`);
        const data = await response.json();
        setTeams(data?.teams);
        // set zustand
        setTeam({
          id: data?.teams[0]?.id,
          name: data?.teams[0]?.name,
          roleName: data?.teams[0]?.roleName,
          email: data?.teams[0]?.email,
        });
      } catch (error) {
        console.error("Error fetching teams:", error);
        throw new Error("Failed to fetch teams");
      }
    };
    if (status === "authenticated") {
      getTeamsByRoles();
    }
  }, [status]);
  console.log("teams", teams);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isTeamsMember && <TeamSwitcher teams={teams} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} isTeamsMember={isTeamsMember} />
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
