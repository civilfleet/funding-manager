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
import { APP_MODULES, AppModule } from "@/types";

type NavigationKey = keyof typeof navigationItems;
type NavigationItem = (typeof navigationItems)[NavigationKey][number];
type NavigationList = NavigationItem[];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems: "team" | "organization" | "admin";
};

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; email: string; modules?: AppModule[] }>>([]);
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
        setTeams(
          teams.map((team: { id: string; name: string; email: string; modules?: AppModule[] }) => ({
            ...team,
            modules: team.modules && team.modules.length ? team.modules : APP_MODULES,
          }))
        );
        setOrganizations(organizations);
      } catch (error) {
        console.error("Error fetching teams:", error);
        throw new Error("Failed to fetch teams");
      }
    };

    getItems();
  }, [session?.user?.roles]);

  const activeTeam = activeType === "team" ? teams.find((item) => item.id === activeId) : null;

  const allowedModules = activeTeam?.modules && activeTeam.modules.length > 0 ? activeTeam.modules : APP_MODULES;

  const filterNavItemsByModules = React.useCallback(
    (items: NavigationList): NavigationList => {
      if (navItems !== "team") {
        return items;
      }

      const modules = allowedModules;

      if (!modules || modules.length === 0) {
        return items;
      }

      const filtered = items.filter((item) => {
        if (item?.module) {
          return modules.includes(item.module);
        }
        return true;
      });

      const cleaned: NavigationItem[] = [];

      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i];

        if (item.type === "separator") {
          const hasPreviousContent = cleaned.length > 0 && cleaned[cleaned.length - 1].type !== "separator";
          let j = i + 1;
          while (j < filtered.length && filtered[j].type === "separator") {
            j++;
          }
          const hasNextContent = j < filtered.length;

          if (!hasPreviousContent || !hasNextContent) {
            continue;
          }
        }

        cleaned.push(item);
      }

      if (cleaned.length && cleaned[cleaned.length - 1].type === "separator") {
        cleaned.pop();
      }

      return cleaned;
    },
    [allowedModules, navItems]
  );

  const navItemsToRender = React.useMemo(() => {
    const items = navigationItems[navItems] as NavigationList;
    return filterNavItemsByModules([...items]);
  }, [filterNavItemsByModules, navItems]);

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
        <NavMain items={navItemsToRender} />
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
