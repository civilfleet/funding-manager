"use client";

import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationStore, useTeamStore } from "@/store/store";

type SwitcherItem = {
  id: string;
  name: string;
  roleName?: string;
  email: string;
};

export function TeamSwitcher({
  organizations,
  teams,
}: {
  organizations: SwitcherItem[];
  teams: SwitcherItem[];
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const { teamId, setTeamId } = useTeamStore();
  const { organizationId, setOrganizationId } = useOrganizationStore();

  const [activeItem, setActiveItem] = useState<SwitcherItem | null>(null);

  useEffect(() => {
    if (teamId) {
      const selectedTeam = teams.find((item) => item.id === teamId) || teams[0];
      setActiveItem(selectedTeam);
    } else if (organizationId) {
      const selectedOrg =
        organizations.find((item) => item.id === organizationId) ||
        organizations[0];
      setActiveItem(selectedOrg);
    } else {
      setActiveItem(teams[0] || organizations[0] || null);
    }
  }, [teamId, organizationId, teams, organizations]);

  const setItem = (item: SwitcherItem, subUrl: string, id: string) => {
    setActiveItem(item); // Only setting once here

    if (subUrl === "teams") {
      setTeamId(id);
      setOrganizationId("");
      router.push(`/${subUrl}/${id}/organizations`);
    } else {
      setOrganizationId(id);
      setTeamId("");
      router.push(`/${subUrl}/${id}/profile`);
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeItem?.name}
                </span>
                <span className="truncate text-xs">
                  {teamId ? "Team" : "Organization"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {teams.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Teams
                </DropdownMenuLabel>

                {teams.map((item, index) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => setItem(item, "teams", item.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {/* {item.logo ? (
            <item.logo className="size-4 shrink-0" />
          ) : ( */}
                      <GalleryVerticalEnd className="size-4 shrink-0" />
                      {/* )} */}
                    </div>
                    {item.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            {organizations.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organizations
                </DropdownMenuLabel>
                {organizations.map((item, index) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => setItem(item, "organizations", item.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {/* {item.logo ? (
            <item.logo className="size-4 shrink-0" />
          ) : ( */}
                      <GalleryVerticalEnd className="size-4 shrink-0" />
                      {/* )} */}
                    </div>
                    {item.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
