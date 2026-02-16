import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DonationAgreementStatusBadge } from "@/components/helper/status-badge";
import { Button } from "@/components/ui/button";
import type { DonationAgreement } from "@/types";

const truncateText = (value?: string, maxLength = 20) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
};

export const columns: ColumnDef<DonationAgreement>[] = [
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="text-left">
          <Button asChild variant="outline" size="sm">
            <Link href={`donation-agreements/${request.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "fundingRequest",
    header: () => <div className="text-left w-36">Funding Request</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {truncateText(row.original?.fundingRequest?.name, 20) || "N/A"}
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
