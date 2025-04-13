"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

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
import navigationItems from "./nav-items";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems: "team" | "organization" | "admin";
};

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [teams, setItems] = useState([]);
  const pathname = usePathname();
  
  // Extract the active ID and type from the URL
  const pathSegments = pathname.split("/").filter(Boolean);
  const activeType = pathSegments[0] === "teams" ? "team" : 
                    pathSegments[0] === "organizations" ? "organization" :
                    pathSegments[0] === "admin" ? "admin" : null;
  const activeId = pathSegments[0] === "admin" ? "admin" : pathSegments[1] ?? null;

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetch(`/api/users/current`);
        const {
          data: { teams, organizations },
        } = await response.json();
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
        <TeamSwitcher 
          organizations={organizations} 
          teams={teams} 
          activeId={activeId}
          activeType={activeType}
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigationItems[navItems]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            image: session?.user?.image || "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
