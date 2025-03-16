import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from "@/types";

export const columns: ColumnDef<User>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <a href={`user/${request.id}`}>
              <DropdownMenuItem>View</DropdownMenuItem>
            </a>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left w-36">Name</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.name || "N/A"}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left w-36">Email</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.email || "N/A"}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-left w-36">Phone</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.phone || "N/A"}</div>
    ),
  },
  {
    accessorKey: "city",
    header: () => <div className="text-left w-36">City</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.city || "N/A"}</div>
    ),
  },
  {
    accessorKey: "country",
    header: () => <div className="text-left w-36">Country</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.country || "N/A"}</div>
    ),
  },
  {
    accessorKey: "roles",
    header: () => <div className="text-left w-36">Roles</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.roles || "N/A"}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left w-36">Created At</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original?.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-left w-36">Updated At</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original?.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
];
