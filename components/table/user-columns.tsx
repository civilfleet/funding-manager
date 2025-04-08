import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useOrganizationStore, useTeamStore } from "@/store/store";
import { useRouter } from "next/navigation";

import { User } from "@/types";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left w-36">Name</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left w-36">Email</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.email || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-left w-36">Phone</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.phone || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: () => <div className="text-left w-36">City</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.city || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: () => <div className="text-left w-36">Country</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.country || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "roles",
    header: () => <div className="text-left w-36">Roles</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.roles || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left w-36">Created At</div>,
    cell: ({ row }) => (
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
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
      <div className="text-left cursor-pointer hover:text-primary" onClick={() => window.location.href = `users/${row.original.id}`}>
        {row.original?.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
  },
];

const UserActions = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const router = useRouter();
  const { organizationId } = useOrganizationStore();
  const { teamId } = useTeamStore();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId, teamId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User has been removed successfully",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};
