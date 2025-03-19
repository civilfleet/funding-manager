"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
  const parts = pathname.split("/"); // ["", "teams", "de5c05a3-460f-480d-a899-e1b5e850f3b4", ...]

  const id = parts[2] ?? null; // Extracts the team ID
  const subUrl = parts[1] ?? null; // Extracts the sub URL

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item) => {
          let fullPath = item.url; // Default to item URL

          return (
            <SidebarMenuItem key={item.title}>
              <Link href={`/${subUrl}/${id}/${fullPath}/`}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
