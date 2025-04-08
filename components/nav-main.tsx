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
  
  // Extract the subUrl and id from the pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const subUrl = pathSegments[0] ?? null;
  const id = pathSegments[1] ?? null;

  // Determine if we have an active context based on the URL
  const hasActiveContext = Boolean(id && (subUrl === "organizations" || subUrl === "teams"));

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
