"use client";

import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

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
import { useOrganizationStore, useTeamStore } from "@/store/store";

export function TeamSwitcher({
  items,
  isTeamsMember,
}: {
  items: {
    id: string;
    name: string;
    roleName?: string;
    email: string;
    // logo: string;
  }[];
  isTeamsMember: boolean;
}) {
  const { isMobile } = useSidebar();
  const { data: session, update: updateSession, status } = useSession();
  const { setTeam: setTeamGlobal, team } = useTeamStore();
  const { setOrganization: setOrganizationGlobal, organization } =
    useOrganizationStore();

  const [activeItem, setActiveItem] = useState(items[0]);
  useEffect(() => {
    if (items.length > 0) {
      if (isTeamsMember) {
        setActiveItem(team); // Set the first team as active
      } else {
        setActiveItem(organization); // Set the first team as active
      }
    }
  }, [items]);
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const setItem = async (item: any) => {
    if (status === "authenticated") {
      if (isTeamsMember) {
        await updateSession({
          user: {
            ...session?.user,
            teamId: item.id,
            organizationId: undefined,
          },
        });
        setTeamGlobal(item);
        setActiveItem(team);
      } else {
        await updateSession({
          user: {
            ...session?.user,
            organizationId: item.id,
            teamId: undefined,
          },
        });

        setOrganizationGlobal(item);
        setActiveItem(organization);
      }

      window.location.reload();
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
                {/* {activeTeam?.logo ? (
                  <activeTeam.logo />
                ) : ( */}
                <GalleryVerticalEnd className="size-4" />
                {/* )} */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeItem?.name}
                </span>
                {/* <span className="truncate text-xs">{activeTeam || ""}</span> */}
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
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {items &&
              items?.map((item, index) => (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => setItem(item)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {/* {team?.logo ? (
                      <team.logo className="size-4 shrink-0" />
                    ) : ( */}
                    <GalleryVerticalEnd className="size-4 shrink-0" />
                    {/* )} */}
                  </div>
                  {item.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
