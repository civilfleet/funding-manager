"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import useSWR from "swr";

import { createEventSchema, updateEventSchema } from "@/validations/events";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type CreateEventFormValues = z.infer<typeof createEventSchema>;
type UpdateEventFormValues = z.infer<typeof updateEventSchema>;

interface EventFormProps {
  teamId: string;
  event?: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    contacts: Array<{
      id: string;
      name: string;
    }>;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDateForInput = (date?: Date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EventForm({ teamId, event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!event;

  const { data: contactsData } = useSWR(`/api/contacts?teamId=${teamId}`, fetcher);

  const contacts = contactsData?.data || [];

  const form = useForm<CreateEventFormValues | UpdateEventFormValues>({
    resolver: zodResolver(isEditMode ? updateEventSchema : createEventSchema),
    defaultValues: {
      teamId,
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: formatDateForInput(event?.startDate) || "",
      endDate: formatDateForInput(event?.endDate) || "",
      contactIds: event?.contacts.map((c) => c.id) || [],
      ...(isEditMode && { id: event.id }),
    },
  });

  useEffect(() => {
    form.setValue("teamId", teamId);
  }, [teamId, form]);

  const { control, watch, setValue } = form;
  const selectedContactIds = watch("contactIds");

  const handleContactToggle = (contactId: string) => {
    const currentIds = selectedContactIds || [];
    const newIds = currentIds.includes(contactId)
      ? currentIds.filter((id) => id !== contactId)
      : [...currentIds, contactId];
    setValue("contactIds", newIds);
  };

  const onSubmit = async (values: CreateEventFormValues | UpdateEventFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/events/${event.id}` : "/api/events";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Failed to ${isEditMode ? "update" : "create"} event`);
      }

      toast({
        title: isEditMode ? "Event updated" : "Event created",
        description: `${values.title} has been ${isEditMode ? "updated" : "added"}.`,
      });

      router.push(`/teams/${teamId}/events`);
      router.refresh();
    } catch (error) {
      toast({
        title: `Unable to ${isEditMode ? "update" : "create"} event`,
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl font-semibold">
          {isEditMode ? "Edit Event" : "Add Event"}
        </CardTitle>
        <CardDescription>
          {isEditMode ? "Update event details and linked contacts." : "Create a new event and link contacts."}
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...form.register("teamId")} value={teamId} />
          {isEditMode && <input type="hidden" {...form.register("id")} value={event.id} />}

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Annual Fundraising Gala" {...field} value={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="location"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Convention Center, Main Hall" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Event details and agenda..."
                        className="min-h-24"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Linked Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Select contacts associated with this event.
                </p>
              </div>

              <div className="space-y-2">
                {contacts.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No contacts available. Create contacts first to link them to events.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto rounded-md border p-4 space-y-2">
                    {contacts.map((contact: { id: string; name: string; email?: string }) => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`contact-${contact.id}`}
                          checked={selectedContactIds?.includes(contact.id)}
                          onCheckedChange={() => handleContactToggle(contact.id)}
                        />
                        <label
                          htmlFor={`contact-${contact.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {contact.name}
                          {contact.email && (
                            <span className="text-muted-foreground ml-2">({contact.email})</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating" : "Saving"}
                </>
              ) : isEditMode ? (
                "Update event"
              ) : (
                "Save event"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
