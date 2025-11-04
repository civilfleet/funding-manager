import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { File } from "@/types";
export const columns: ColumnDef<File>[] = [
  {
    accessorKey: "organization",
    header: () => <div className="text-left w-36">Organization</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original?.organization?.name || "N/A"}
      </div>
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
      <div className="text-left  text-blue-500">
        <Link
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${row.original?.id}`}
        >
          {row.original?.url || "N/A"}
        </Link>
      </div>
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
