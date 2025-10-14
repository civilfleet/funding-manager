"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DataTable } from "@/components/data-table";
import { contactColumns, renderContactCard, type ContactRow } from "@/components/table/contact-columns";
import FormInputControl from "@/components/helper/form-input-control";
import ButtonControl from "@/components/helper/button-control";
import { Form } from "@/components/ui/form";
import { Loader } from "@/components/helper/loader";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContactTableProps {
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const querySchema = z.object({
  query: z.string(),
});

export default function ContactTable({ teamId }: ContactTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  // Wrap renderContactCard with teamId
  const renderCard = (contact: ContactRow) => renderContactCard(contact, teamId);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/contacts?teamId=${teamId}&query=${encodeURIComponent(query)}`,
    fetcher
  );

  const { data: rolesData, isLoading: rolesLoading } = useSWR(
    `/api/event-roles?teamId=${teamId}`,
    fetcher
  );

  const eventRoles = useMemo(() => {
    if (!rolesData?.data) {
      return [];
    }
    return rolesData.data as Array<{ id: string; name: string; color?: string }>;
  }, [rolesData]);

  const allContacts = useMemo<ContactRow[]>(() => {
    if (!data?.data) {
      return [];
    }

    return data.data as ContactRow[];
  }, [data]);

  const contacts = useMemo<ContactRow[]>(() => {
    if (!selectedRoleFilter) {
      return allContacts;
    }

    return allContacts.filter((contact) => {
      if (!contact.events || contact.events.length === 0) {
        return false;
      }

      return contact.events.some((eventContact) =>
        eventContact.roles.some((role) => role.eventRole.id === selectedRoleFilter)
      );
    });
  }, [allContacts, selectedRoleFilter]);

  if (error) {
    toast({
      title: "Unable to load contacts",
      description: "An unexpected error occurred while fetching contacts.",
      variant: "destructive",
    });
  }

  const handleSubmit = (values: z.infer<typeof querySchema>) => {
    form.setValue("query", values.query);
  };

  const handleDeleteSelected = async (
    selectedRows: ContactRow[],
    clearSelection: () => void
  ) => {
    if (selectedRows.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          ids: selectedRows.map((contact) => contact.id),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to delete contacts");
      }

      toast({
        title: "Contacts deleted",
        description: `${selectedRows.length} contact${
          selectedRows.length > 1 ? "s" : ""
        } removed successfully.`,
      });

      clearSelection();
      await mutate();
    } catch (deleteError) {
      toast({
        title: "Unable to delete contacts",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleFilterToggle = (roleId: string) => {
    setSelectedRoleFilter((current) => (current === roleId ? null : roleId));
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full max-w-md">
          <FormInputControl form={form} name="query" placeholder="Search contacts" />
          <ButtonControl type="submit" label="Search" className="ml-2" />
        </form>
      </Form>

      {!rolesLoading && eventRoles.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter by event role:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventRoles.map((role) => (
              <Badge
                key={role.id}
                variant={selectedRoleFilter === role.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent transition-colors"
                style={
                  selectedRoleFilter === role.id && role.color
                    ? {
                        backgroundColor: `${role.color}20`,
                        color: role.color,
                        borderColor: role.color,
                      }
                    : {}
                }
                onClick={() => handleRoleFilterToggle(role.id)}
              >
                {role.name}
                {selectedRoleFilter === role.id && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-md border p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={contactColumns}
            data={contacts}
            renderCard={renderCard}
            initialView="table"
            selectable
            renderBatchActions={({ selectedRows, clearSelection }) => (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => handleDeleteSelected(selectedRows, clearSelection)}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      "Delete selected"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting || selectedRows.length === 0}
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
