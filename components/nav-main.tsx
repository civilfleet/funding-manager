"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Computer, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Roles } from "@/types";
import { useOrganizationStore, useTeamStore } from "@/store/store";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function NavMain({ items = [] }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const parts = pathname.split("/");
  const id = parts[2] ?? null;
  const subUrl = parts[1] ?? null;
  const { teamId } = useTeamStore();
  const { organizationId } = useOrganizationStore();

  const hasActiveContext = Boolean(teamId || organizationId);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {hasActiveContext ? (
          <>
            {items.map((item, index) => {
              const fullPath = `/${subUrl}/${id}/${item.url}/`;
              const isActive = pathname.startsWith(fullPath);

              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link href={fullPath}>
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </>
        ) : (
          <SidebarMenuItem>
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Please select a team or organization
            </div>
          </SidebarMenuItem>
        )}

        {session?.user?.roles?.includes(Roles.Admin) && (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Admin"
              isActive={pathname.startsWith("/admin")}
            >
              <Link href="/admin">
                <Computer className="size-4" />
                <span>Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
