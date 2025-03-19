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

export function NavMain({
  items,
}: {
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const parts = pathname.split("/"); // ["", "teams", "de5c05a3-460f-480d-a899-e1b5e850f3b4", ...]

  const id = parts[2] ?? null;
  const subUrl = parts[1] ?? null;

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item, index) => {
          const fullPath = item.url;
          return (
            <SidebarMenuItem key={index}>
              <Link href={`/${subUrl}/${id}/${fullPath}/`}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}

        {session?.user?.roles?.includes(Roles.Admin) && (
          <SidebarMenuItem>
            <Link href="/admin">
              <SidebarMenuButton tooltip="Admin">
                <Computer />
                <span>Admin</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
