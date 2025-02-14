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
import { File } from "@/types";
export const columns: ColumnDef<File>[] = [
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
            <a href={`funding-request/${request.id}`}>
              <DropdownMenuItem>View</DropdownMenuItem>
            </a>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "organization.name",
    header: () => <div className="text-left w-36">Organization</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.name || "N/A"}</div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="text-left w-36">Type</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.type || "N/A"}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left w-36">Created At</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original?.createdAt
          ? new Date(row.original.createdAt).toLocaleString()
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
          ? new Date(row.original.updatedAt).toLocaleString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "url",
    header: () => <div className="text-left w-36">URL</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.url || "N/A"}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: () => <div className="text-left w-36">Created By</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.createdBy?.email || "N/A"}</div>
    ),
  },
  {
    accessorKey: "updatedBy",
    header: () => <div className="text-left w-36">Updated By</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.updatedBy?.email || "N/A"}</div>
    ),
  },
];
