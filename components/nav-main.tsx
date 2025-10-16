"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Roles } from "@/types";

interface NavItem {
  title?: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  type?: "separator";
  label?: string;
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
  const hasActiveContext = Boolean(
    id && (subUrl === "organizations" || subUrl === "teams"),
  );
  const isAdminSection = pathname.startsWith("/admin");

  return (
    <SidebarGroup>
      <SidebarMenu>
        {isAdminSection ? (
          <>
            {items.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <div key={index} className="px-2 py-2">
                    {item.label && (
                      <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
                        {item.label}
                      </div>
                    )}
                    <Separator />
                  </div>
                );
              }

              const fullPath = `/admin/${item.url}`;
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
        ) : hasActiveContext ? (
          <>
            {items.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <div key={index} className="px-2 py-2">
                    {item.label && (
                      <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
                        {item.label}
                      </div>
                    )}
                    <Separator />
                  </div>
                );
              }

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
      </SidebarMenu>
    </SidebarGroup>
  );
}
