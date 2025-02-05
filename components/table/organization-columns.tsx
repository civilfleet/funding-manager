"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type OrganizationColumns = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  taxID?: string;
  contactPerson?: {
    email: string;
  };
  bankDetails?: {
    bankName: string;
  };
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<OrganizationColumns>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <a href={`/admin/organization/${organization.id}`}>View</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center w-24">Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("name") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-center w-24">Email</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("email") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-center max-w-24">Phone</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("phone") || "N/A"}
        </div>
      );
    },
  },

  {
    accessorKey: "country",
    header: () => <div className="text-center w-24">Country</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("country") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "website",
    header: () => <div className="text-center w-24">Website</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("website") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "taxID",
    header: () => <div className="text-center w-24">Tax ID</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("taxID") || "N/A"}
        </div>
      );
    },
  },

  {
    accessorKey: "contactPerson.email",
    header: () => <div className="text-center w-24">Contact Email</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.contactPerson?.email || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "bankDetails.bankName",
    header: () => <div className="text-center w-24">Bank Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.bankDetails?.bankName || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center w-24">Created At</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {new Date(row.getValue("createdAt")).toLocaleDateString() || "N/A"}
        </div>
      );
    },
  },
];
