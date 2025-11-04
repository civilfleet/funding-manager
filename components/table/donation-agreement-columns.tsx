import type { ColumnDef } from "@tanstack/react-table";
import { truncate } from "lodash";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DonationAgreementStatusBadge } from "@/components/helper/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DonationAgreement } from "@/types";

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
    accessorKey: "status",
    header: () => <div className="text-left w-36">Status</div>,
    cell: ({ row }) => {
      const signed = row.original.userSignatures.every((user) => user.signedAt);

      return (
        <div className="text-left">
          <DonationAgreementStatusBadge
            status={signed ? "completed" : "pending"}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: () => <div className="text-left w-36">Created By</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original?.createdBy.email || "N/A"}</div>
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
];
