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
import { Loader2 } from "lucide-react";

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

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  const { data, error, isLoading, mutate } = useSWR(
    `/api/contacts?teamId=${teamId}&query=${encodeURIComponent(query)}`,
    fetcher
  );

  const contacts = useMemo<ContactRow[]>(() => {
    if (!data?.data) {
      return [];
    }

    return data.data as ContactRow[];
  }, [data]);

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

  return (
    <div className="flex flex-col gap-4 my-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full max-w-md">
          <FormInputControl form={form} name="query" placeholder="Search contacts" />
          <ButtonControl type="submit" label="Search" className="ml-2" />
        </form>
      </Form>

      <div className="rounded-md border p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader />
          </div>
        ) : (
          <DataTable
            columns={contactColumns}
            data={contacts}
            renderCard={renderContactCard}
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
