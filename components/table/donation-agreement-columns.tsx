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
import { DonationAgreement } from "@/types";
import { truncate } from "lodash";
import Link from "next/link";

export const columns: ColumnDef<DonationAgreement>[] = [
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
            <a href={`donation-agreements/${request.id}`}>
              <DropdownMenuItem>View</DropdownMenuItem>
            </a>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "fundingRequest",
    header: () => <div className="text-left w-36">Funding Request</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {truncate(row.original?.fundingRequest?.name, {
          length: 20,
          omission: "...",
        }) || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="text-left w-36">Type</div>,
    cell: ({ row }) => (
      <div className="text-left text-blue-500">
        {
          <Link
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${row.original.file?.id}`}
          >
            {row.original?.file?.type || "N/A"}
          </Link>
        }
      </div>
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
    accessorKey: "createdBy",
    header: () => <div className="text-left w-36">Created By</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.createdBy.email || "N/A"}</div>
    ),
  },
];
