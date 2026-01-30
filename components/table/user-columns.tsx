import type { ColumnDef } from "@tanstack/react-table";
import { Crown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import type { User } from "@/types";

const userDetailPath = (id: string) => `users/${id}`;

const NavigableCell = ({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) => (
  <Link
    href={userDetailPath(id)}
    className={cn(
      "block text-left cursor-pointer hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      className,
    )}
  >
    {children}
  </Link>
);

export const columns: ColumnDef<User & { isOwner?: boolean }>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left w-36">Name</div>,
    cell: ({ row }) => (
      <NavigableCell
        id={row.original.id}
        className="flex items-center gap-2"
      >
        <span>{row.original?.name || "N/A"}</span>
        {row.original.isOwner ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Owner
          </Badge>
        ) : null}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left w-36">Email</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.email || "N/A"}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-left w-36">Phone</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.phone || "N/A"}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "city",
    header: () => <div className="text-left w-36">City</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.city || "N/A"}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "country",
    header: () => <div className="text-left w-36">Country</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.country || "N/A"}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "roles",
    header: () => <div className="text-left w-36">Roles</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {Array.isArray(row.original?.roles)
          ? row.original.roles.join(', ')
          : row.original?.roles || 'N/A'}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "groups",
    header: () => <div className="text-left w-48">Groups</div>,
    cell: ({ row }) => {
      const groups = row.original?.groups;
      if (!groups || groups.length === 0) {
        return (
          <NavigableCell id={row.original.id}>No groups</NavigableCell>
        );
      }
      return (
        <NavigableCell id={row.original.id} className="flex flex-wrap gap-1">
          {groups.map(
            (userGroup: {
              groupId: string;
              group: { id: string; name: string };
            }) => (
              <Badge
                key={userGroup.groupId}
                variant="secondary"
                className="text-xs"
              >
                {userGroup.group.name}
              </Badge>
            ),
          )}
        </NavigableCell>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left w-36">Created At</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "N/A"}
      </NavigableCell>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-left w-36">Updated At</div>,
    cell: ({ row }) => (
      <NavigableCell id={row.original.id}>
        {row.original?.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString()
          : "N/A"}
      </NavigableCell>
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
  const params = useParams();

  const teamId = params?.teamId ? params?.teamId : "";
  const organizationId = params?.organizationId ? params.organizationId : "";

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId, teamId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User has been removed successfully",
      });

      router.refresh();
    } catch (_error) {
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
