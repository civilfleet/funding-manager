"use client";

import { Check, Copy, Download, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactListType } from "@/types";

type ContactList = {
  id: string;
  name: string;
  description?: string;
  type: ContactListType;
  contactCount: number;
  updatedAt: string | Date;
  contacts: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
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
  const isMobile = useIsMobile();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedListId, setCopiedListId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("updated-desc");

  const { data: listsData, mutate } = useSWR(
    `/api/contact-lists?teamId=${teamId}`,
    fetcher,
  );

  const lists: ContactList[] = useMemo(
    () => (listsData?.data as ContactList[]) || [],
    [listsData],
  );
  const sortedLists = useMemo(() => {
    const sortable = [...lists];
    switch (sortKey) {
      case "name-asc":
        return sortable.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sortable.sort((a, b) => b.name.localeCompare(a.name));
      case "count-desc":
        return sortable.sort((a, b) => b.contactCount - a.contactCount);
      case "count-asc":
        return sortable.sort((a, b) => a.contactCount - b.contactCount);
      case "updated-asc":
        return sortable.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
      case "updated-desc":
      default:
        return sortable.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }
  }, [lists, sortKey]);
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

  const handleCopyContacts = async (list: ContactList) => {
    if (!list.contacts?.length) {
      toast({
        title: "No contacts to copy",
        description: "Add contacts to this list to copy them.",
      });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Clipboard unavailable",
        description: "Copying contacts is not supported in this environment.",
        variant: "destructive",
      });
      return;
    }

    const contactsText = list.contacts
      .map((contact) => {
        const name = contact.name?.trim();
        const email = contact.email?.trim();

        if (name && email) {
          return `${name} <${email}>`;
        }

        if (email) {
          return email;
        }

        return name ?? "";
      })
      .filter((entry) => entry.length > 0)
      .join("\n");

    if (!contactsText) {
      toast({
        title: "Nothing to copy",
        description:
          "Contacts in this list are missing names or emails to copy.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(contactsText);
      setCopiedListId(list.id);
      toast({
        title: "Contacts copied",
        description: `Copied ${list.contacts.length} contact${
          list.contacts.length === 1 ? "" : "s"
        } to your clipboard.`,
      });
      setTimeout(() => setCopiedListId((current) =>
        current === list.id ? null : current,
      ), 2000);
    } catch (error) {
      toast({
        title: "Unable to copy contacts",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const buildEmailExport = (list: ContactList) => {
    const emails = Array.from(
      new Set(
        list.contacts
          .map((contact) => contact.email?.trim())
          .filter((email): email is string => Boolean(email)),
      ),
    );

    return emails.length > 0 ? ["email", ...emails].join("\n") : "";
  };

  const handleExportEmails = (list: ContactList) => {
    const csvContent = buildEmailExport(list);
    if (!csvContent) {
      toast({
        title: "No emails to export",
        description: "Add contacts with email addresses to export.",
      });
      return;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${list.name.replace(/\s+/g, "-").toLowerCase()}-emails.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortKey} onValueChange={setSortKey}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Sort lists" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-desc">Updated (newest)</SelectItem>
              <SelectItem value="updated-asc">Updated (oldest)</SelectItem>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="count-desc">Contacts (high → low)</SelectItem>
              <SelectItem value="count-asc">Contacts (low → high)</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
          <Link href={`/teams/${teamId}/crm/lists/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add list
          </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading lists...
          </div>
        ) : sortedLists.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No lists created yet. Create your first list to get started.
          </div>
        ) : isMobile ? (
          <div className="grid grid-cols-1 gap-3 p-3">
            {sortedLists.map((list) => (
              <Card key={list.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        <Link
                          href={`/teams/${teamId}/crm/lists/${list.id}`}
                          className="hover:underline"
                        >
                          {list.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs uppercase">
                        {list.type === ContactListType.SMART ? "Smart" : "Manual"}
                      </Badge>
                    </div>
                    <Badge className="flex w-fit items-center gap-1" variant="secondary">
                      <Users className="h-3 w-3" />
                      {list.contactCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="text-sm text-muted-foreground">
                    {list.description || "No description"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleCopyContacts(list)}
                      aria-label="Copy contacts"
                    >
                      {copiedListId === list.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleExportEmails(list)}
                      aria-label="Export emails"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="gap-1">
                      <Link href={`/teams/${teamId}/crm/lists/${list.id}`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(list.id, list.name)}
                      aria-label="Delete list"
                      disabled={deletingId === list.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                {sortedLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teams/${teamId}/crm/lists/${list.id}`}
                          className="hover:underline"
                        >
                          {list.name}
                        </Link>
                        <Badge variant="outline" className="text-xs uppercase">
                          {list.type === ContactListType.SMART ? "Smart" : "Manual"}
                        </Badge>
                      </div>
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
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyContacts(list)}
                          aria-label="Copy contacts"
                          title="Copy contacts"
                        >
                          {copiedListId === list.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportEmails(list)}
                          aria-label="Export emails"
                          title="Export emails"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label="Edit list"
                        >
                          <Link href={`/teams/${teamId}/crm/lists/${list.id}`}>
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
