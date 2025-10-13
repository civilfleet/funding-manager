"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
      roles: Array<{
        id: string;
        name: string;
        color?: string;
      }>;
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
  const [contactRoles, setContactRoles] = useState<Record<string, string[]>>(() => {
    const roles: Record<string, string[]> = {};
    event?.contacts.forEach((c) => {
      roles[c.id] = c.roles.map((r) => r.id);
    });
    return roles;
  });

  const isEditMode = !!event;

  const { data: contactsData } = useSWR(`/api/contacts?teamId=${teamId}`, fetcher);
  const { data: rolesData } = useSWR(`/api/event-roles?teamId=${teamId}`, fetcher);

  const contacts = contactsData?.data || [];
  const availableRoles = rolesData?.data || [];

  const form = useForm({
    resolver: zodResolver(isEditMode ? updateEventSchema : createEventSchema),
    defaultValues: {
      teamId,
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: formatDateForInput(event?.startDate) || "",
      endDate: formatDateForInput(event?.endDate) || "",
      contacts:
        event?.contacts.map((c) => ({
          contactId: c.id,
          roleIds: c.roles.map((r) => r.id),
        })) || [],
    },
  });

  useEffect(() => {
    form.setValue("teamId", teamId);
  }, [teamId, form]);

  const { control, watch, setValue } = form;
  const typedControl = control as unknown as import("react-hook-form").Control<CreateEventFormValues>;
  const selectedContacts = watch("contacts") || [];

  const isContactSelected = (contactId: string) => {
    return selectedContacts.some((c) => c.contactId === contactId);
  };

  const handleContactToggle = (contactId: string) => {
    const currentContacts = selectedContacts || [];
    const isSelected = currentContacts.some((c) => c.contactId === contactId);

    if (isSelected) {
      // Remove contact
      const newContacts = currentContacts.filter((c) => c.contactId !== contactId);
      setValue("contacts", newContacts);
      // Also clear roles from state
      const newRoles = { ...contactRoles };
      delete newRoles[contactId];
      setContactRoles(newRoles);
    } else {
      // Add contact
      setValue("contacts", [...currentContacts, { contactId, roleIds: contactRoles[contactId] || [] }]);
    }
  };

  const handleRoleToggle = (contactId: string, roleId: string) => {
    const currentRoles = contactRoles[contactId] || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter((id) => id !== roleId)
      : [...currentRoles, roleId];

    setContactRoles({ ...contactRoles, [contactId]: newRoles });

    // Update the form value
    const currentContacts = selectedContacts || [];
    const newContacts = currentContacts.map((c) =>
      c.contactId === contactId ? { ...c, roleIds: newRoles } : c
    );
    setValue("contacts", newContacts);
  };

  const getRoleById = (roleId: string) => {
    return availableRoles.find((r: { id: string }) => r.id === roleId);
  };

  const onSubmit = async (values: CreateEventFormValues | UpdateEventFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/events/${event.id}` : "/api/events";
      const method = isEditMode ? "PUT" : "POST";

      const payload = isEditMode ? { ...values, id: event.id } : values;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={typedControl}
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
                control={typedControl}
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
                control={typedControl}
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
                control={typedControl}
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
                control={typedControl}
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
                  Select contacts and assign roles from the dropdown.
                </p>
              </div>

              {availableRoles.length === 0 && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  No event roles configured. Visit Settings to create event roles like &quot;Partner&quot;, &quot;Musician&quot;, etc.
                </div>
              )}

              <div className="space-y-2">
                {contacts.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No contacts available. Create contacts first to link them to events.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto rounded-md border p-4 space-y-3">
                    {contacts.map((contact: { id: string; name: string; email?: string }) => {
                      const isSelected = isContactSelected(contact.id);
                      const selectedRoleIds = contactRoles[contact.id] || [];
                      return (
                        <div
                          key={contact.id}
                          className="flex flex-col gap-2 p-3 rounded-md border bg-muted/30"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`contact-${contact.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleContactToggle(contact.id)}
                            />
                            <label
                              htmlFor={`contact-${contact.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {contact.name}
                              {contact.email && (
                                <span className="text-muted-foreground ml-2">({contact.email})</span>
                              )}
                            </label>
                          </div>
                          {isSelected && availableRoles.length > 0 && (
                            <div className="ml-6 space-y-2">
                              <div className="text-xs text-muted-foreground">Roles:</div>
                              <div className="flex flex-wrap gap-2">
                                {availableRoles.map((role: { id: string; name: string; color?: string }) => {
                                  const isRoleSelected = selectedRoleIds.includes(role.id);
                                  return (
                                    <Badge
                                      key={role.id}
                                      variant={isRoleSelected ? "default" : "outline"}
                                      className="cursor-pointer"
                                      style={
                                        isRoleSelected && role.color
                                          ? { backgroundColor: role.color, borderColor: role.color }
                                          : role.color
                                          ? { borderColor: role.color, color: role.color }
                                          : {}
                                      }
                                      onClick={() => handleRoleToggle(contact.id, role.id)}
                                    >
                                      {role.name}
                                      {isRoleSelected && <X className="ml-1 h-3 w-3" />}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
