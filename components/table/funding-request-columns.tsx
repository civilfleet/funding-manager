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
import { FundingRequest } from "@/types";
export const columns: ColumnDef<FundingRequest>[] = [
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
      <div className="text-left">
        {row.original?.organization?.name || "N/A"}
      </div>
    ),
  },

  {
    accessorKey: "amountRequested",
    header: () => <div className="text-left w-32">Amount Requested</div>,
    cell: ({ row }) => (
      <div className="text-left">
        ${row.getValue("amountRequested")?.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "amountAgreed",
    header: () => <div className="text-left w-32">Amount Agreed</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amountAgreed");
      return (
        <div className="text-left">
          {amount ? `$${amount.toLocaleString()}` : "Pending"}
        </div>
      );
    },
  },
  {
    accessorKey: "expectedCompletionDate",
    header: () => <div className="text-left w-36">Completion Date</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {new Date(row.getValue("expectedCompletionDate")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left w-24">Status</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "submittedBy.name",
    header: () => <div className="text-left w-36">Submitted By</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.submittedBy?.name || "N/A"}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left w-32">Created At</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {new Date(row.getValue("createdAt"))?.toLocaleDateString()}
      </div>
    ),
  },
];
