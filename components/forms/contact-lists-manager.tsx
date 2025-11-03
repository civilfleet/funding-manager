"use client";

import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type ContactList = {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
};

interface ContactListsManagerProps {
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContactListsManager({
  teamId,
}: ContactListsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: listsData, mutate } = useSWR(
    `/api/contact-lists?teamId=${teamId}`,
    fetcher,
  );

  const lists: ContactList[] = useMemo(
    () => (listsData?.data as ContactList[]) || [],
    [listsData],
  );
  const isLoading = !listsData;

  const handleDelete = async (listId: string, listName: string) => {
    if (!confirm(`Are you sure you want to delete "${listName}"?`)) {
      return;
    }

    try {
      setDeletingId(listId);
      const response = await fetch("/api/contact-lists", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          ids: [listId],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to delete list");
      }

      toast({
        title: "List deleted",
        description: `${listName} has been removed.`,
      });

      mutate();
      router.refresh();
    } catch (error) {
      toast({
        title: "Unable to delete list",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contact Lists</h1>
          <p className="text-sm text-muted-foreground">
            Organize your contacts for targeted communication and outreach.
          </p>
        </div>
        <Button asChild>
          <Link href={`/teams/${teamId}/lists/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add list
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading lists...
          </div>
        ) : lists.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No lists created yet. Create your first list to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/teams/${teamId}/lists/${list.id}`}
                        className="hover:underline"
                      >
                        {list.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className="flex w-fit items-center gap-1" variant="secondary">
                        <Users className="h-3 w-3" />
                        {list.contactCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px]">
                      {list.description ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {list.description}
                        </p>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label="Edit list"
                        >
                          <Link href={`/teams/${teamId}/lists/${list.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(list.id, list.name)}
                          aria-label="Delete list"
                          disabled={deletingId === list.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
