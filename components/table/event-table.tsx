"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DataTable } from "@/components/data-table";
import { eventColumns, renderEventCard, type EventRow } from "@/components/table/event-columns";
import FormInputControl from "@/components/helper/form-input-control";
import ButtonControl from "@/components/helper/button-control";
import { Form } from "@/components/ui/form";
import { Loader } from "@/components/helper/loader";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EventTableProps {
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const querySchema = z.object({
  query: z.string(),
});

export default function EventTable({ teamId }: EventTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  const { data, error, isLoading, mutate } = useSWR(
    `/api/events?teamId=${teamId}&query=${encodeURIComponent(query)}`,
    fetcher
  );

  const events = useMemo<EventRow[]>(() => {
    if (!data?.data) {
      return [];
    }

    return data.data as EventRow[];
  }, [data]);

  if (error) {
    toast({
      title: "Unable to load events",
      description: "An unexpected error occurred while fetching events.",
      variant: "destructive",
    });
  }

  const handleSubmit = (values: z.infer<typeof querySchema>) => {
    form.setValue("query", values.query);
  };

  const handleDeleteSelected = async (selectedRows: EventRow[], clearSelection: () => void) => {
    if (selectedRows.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          ids: selectedRows.map((event) => event.id),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to delete events");
      }

      toast({
        title: "Events deleted",
        description: `${selectedRows.length} event${
          selectedRows.length > 1 ? "s" : ""
        } removed successfully.`,
      });

      clearSelection();
      await mutate();
    } catch (deleteError) {
      toast({
        title: "Unable to delete events",
        description:
          deleteError instanceof Error ? deleteError.message : "An unexpected error occurred.",
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
          <FormInputControl form={form} name="query" placeholder="Search events" />
          <ButtonControl type="submit" label="Search" className="ml-2" />
        </form>
      </Form>

      <div className="rounded-md border p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={eventColumns}
            data={events}
            renderCard={renderEventCard}
            initialView="table"
            selectable
            renderBatchActions={({ selectedRows, clearSelection }) => (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
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
