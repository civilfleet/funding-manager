"use client";
import * as React from "react";
import { useSession } from "next-auth/react";

import {
  AudioWaveform,
  BookOpen,
  BookUser,
  Building,
  Command,
  FolderOpen,
  GalleryVerticalEnd,
  LucideIcon,
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
import { Roles } from "@/types/index";

// This is sample data.

type NavigationItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}[];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems: NavigationItem;
};

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [teams, setItems] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetch(`/api/users/current`);
        const {
          data: { teams, organizations },
        } = await response.json();
        console.log(teams, organizations, "orgnaizaiton list ");
        setItems(teams);
        setOrganizations(organizations);
      } catch (error) {
        console.error("Error fetching teams:", error);
        throw new Error("Failed to fetch teams");
      }
    };

    getItems();
  }, [session?.user?.roles]);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher organizations={organizations} teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={props.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name || props.navItems?.user.name,
            email: session?.user?.email || props.navItems?.user.email,
            image: session?.user?.image || props.navItems?.user.avatar,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
