"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, X } from "lucide-react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { generateSlug } from "@/lib/slug";

type CreateEventFormValues = z.infer<typeof createEventSchema>;
type UpdateEventFormValues = z.infer<typeof updateEventSchema>;

interface EventFormProps {
  teamId: string;
  publicBaseUrl?: string;
  event?: {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    isPublic: boolean;
    contacts: Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      roles: Array<{
        id: string;
        name: string;
        color?: string;
      }>;
    }>;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ContactSummary = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

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

export default function EventForm({ teamId, event, publicBaseUrl: initialPublicBaseUrl = "" }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicBaseUrl, setPublicBaseUrl] = useState(initialPublicBaseUrl);
  const [contactRoles, setContactRoles] = useState<Record<string, string[]>>(() => {
    const roles: Record<string, string[]> = {};
    event?.contacts.forEach((c) => {
      roles[c.id] = c.roles.map((r) => r.id);
    });
    return roles;
  });
  const [contactLookup, setContactLookup] = useState<Record<string, ContactSummary>>(() => {
    const initial: Record<string, ContactSummary> = {};
    event?.contacts.forEach((c) => {
      initial[c.id] = {
        id: c.id,
        name: c.name,
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
      };
    });
    return initial;
  });
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [debouncedContactSearch, setDebouncedContactSearch] = useState("");

  const isEditMode = !!event;

  const { data: rolesData } = useSWR(`/api/event-roles?teamId=${teamId}`, fetcher);
  const availableRoles = rolesData?.data || [];

  type FormValues = CreateEventFormValues | UpdateEventFormValues;

  const formResolver = useMemo<Resolver<FormValues>>(
    () => zodResolver(isEditMode ? updateEventSchema : createEventSchema) as Resolver<FormValues>,
    [isEditMode]
  );

  const form = useForm<FormValues>({
    resolver: formResolver,
    defaultValues: isEditMode
      ? ({
          id: event.id,
          teamId,
          title: event?.title || "",
          slug: event?.slug || "",
          description: event?.description || "",
          location: event?.location || "",
          startDate: formatDateForInput(event?.startDate) || "",
          endDate: formatDateForInput(event?.endDate) || "",
          isPublic: event?.isPublic ?? false,
          contacts:
            event?.contacts.map((c) => ({
              contactId: c.id,
              roleIds: c.roles.map((r) => r.id),
            })) || [],
        } satisfies UpdateEventFormValues)
      : ({
          teamId,
          title: "",
          slug: "",
          description: "",
          location: "",
          startDate: "",
          endDate: "",
          isPublic: false,
          contacts: [],
        } satisfies CreateEventFormValues),
  });

  useEffect(() => {
    form.setValue("teamId", teamId);
  }, [teamId, form]);

  useEffect(() => {
    if (initialPublicBaseUrl) {
      setPublicBaseUrl(initialPublicBaseUrl);
      return;
    }

    if (typeof window !== "undefined") {
      setPublicBaseUrl(window.location.origin);
    }
  }, [initialPublicBaseUrl]);

  useEffect(() => {
    if (event?.contacts) {
      setContactLookup((prev) => {
        const next = { ...prev };
        event.contacts.forEach((c) => {
          next[c.id] = {
            id: c.id,
            name: c.name,
            email: c.email ?? undefined,
            phone: c.phone ?? undefined,
          };
        });
        return next;
      });
    }
  }, [event?.contacts]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedContactSearch(contactSearchTerm.trim());
    }, 300);

    return () => window.clearTimeout(handler);
  }, [contactSearchTerm]);

  useEffect(() => {
    if (!contactSearchOpen) {
      setContactSearchTerm("");
      setDebouncedContactSearch("");
    }
  }, [contactSearchOpen]);

  const shouldSearchContacts = contactSearchOpen && debouncedContactSearch.length >= 2;

  const {
    data: contactSearchData,
    isLoading: isContactSearchLoading,
  } = useSWR(
    shouldSearchContacts
      ? `/api/contacts?teamId=${teamId}&query=${encodeURIComponent(debouncedContactSearch)}`
      : null,
    fetcher
  );

  const contactSearchResults: ContactSummary[] = useMemo(
    () =>
      (contactSearchData?.data ?? []).map(
        (contact: { id: string; name: string; email?: string | null; phone?: string | null }) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
        })
      ),
    [contactSearchData]
  );

  useEffect(() => {
    if (contactSearchResults.length === 0) {
      return;
    }

    setContactLookup((prev) => {
      const next = { ...prev };
      contactSearchResults.forEach((contact) => {
        next[contact.id] = contact;
      });
      return next;
    });
  }, [contactSearchResults]);

  const { control, watch, setValue, formState } = form;
  const typedControl = control as unknown as import("react-hook-form").Control<FormValues>;
  const selectedContacts = watch("contacts") || [];
  const titleValue = watch("title") || "";
  const slugValue = watch("slug") || "";
  const normalizedSlug = useMemo(() => (slugValue ? generateSlug(slugValue) : ""), [slugValue]);
  const isPublicValue = watch("isPublic");

  const slugSuggestion = useMemo(() => generateSlug(titleValue), [titleValue]);
  const slugDirty = Boolean(formState.dirtyFields.slug);
  const publicRegistrationUrl = publicBaseUrl && normalizedSlug
    ? `${publicBaseUrl}/public/${teamId}/events/${normalizedSlug}`
    : "";

  // Debug form errors
  useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      console.log("Form validation errors:", formState.errors);
    }
  }, [formState.errors]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (slugDirty) {
      return;
    }

    if (slugSuggestion && slugSuggestion !== slugValue) {
      form.setValue("slug", slugSuggestion, { shouldDirty: false });
    }
  }, [form, isEditMode, slugDirty, slugSuggestion, slugValue]);

  const isContactSelected = (contactId: string) => {
    return selectedContacts.some((c) => c.contactId === contactId);
  };

  const handleAddContact = (contact: ContactSummary) => {
    if (isContactSelected(contact.id)) {
      toast({
        title: "Contact already linked",
        description: `${contact.name} is already associated with this event.`,
      });
      return;
    }

    const updatedContacts = [
      ...selectedContacts,
      { contactId: contact.id, roleIds: contactRoles[contact.id] || [] },
    ];

    setContactLookup((prev) => ({
      ...prev,
      [contact.id]: contact,
    }));

    setContactRoles((prev) => ({
      ...prev,
      [contact.id]: prev[contact.id] || [],
    }));

    setValue("contacts", updatedContacts, { shouldDirty: true, shouldTouch: true });
    setContactSearchTerm("");
    setDebouncedContactSearch("");
    setContactSearchOpen(false);
  };

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = (selectedContacts || []).filter((c) => c.contactId !== contactId);
    setValue("contacts", updatedContacts, { shouldDirty: true, shouldTouch: true });

    setContactRoles((prev) => {
      const next = { ...prev };
      delete next[contactId];
      return next;
    });
  };

  const handleApplySlugSuggestion = () => {
    if (!slugSuggestion) {
      return;
    }

    form.clearErrors("slug");
    form.setValue("slug", slugSuggestion, { shouldDirty: true, shouldValidate: true });
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
    setValue("contacts", newContacts, { shouldDirty: true });
  };

  const onSubmit = async (values: CreateEventFormValues | UpdateEventFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/events/${event.id}` : "/api/events";
      const method = isEditMode ? "PUT" : "POST";

      const normalizedSlugValue = values.slug ? generateSlug(values.slug) : "";
      const payload = {
        ...values,
        slug: normalizedSlugValue || undefined,
      };

      console.log("Submitting event:", { url, method, payload });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("Event submission error:", errorBody);
        throw new Error(errorBody.error || `Failed to ${isEditMode ? "update" : "create"} event`);
      }

      const result = await response.json();
      console.log("Event submission success:", result);

      toast({
        title: isEditMode ? "Event updated" : "Event created",
        description: `${values.title} has been ${isEditMode ? "updated" : "added"}.`,
      });

      router.push(`/teams/${teamId}/events`);
      router.refresh();
    } catch (error) {
      console.error("Event submission catch:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";

      if (error instanceof Error && error.message.toLowerCase().includes("slug is already in use")) {
        form.setError("slug", { type: "manual", message: error.message });
      }

      toast({
        title: `Unable to ${isEditMode ? "update" : "create"} event`,
        description: message,
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
          {isEditMode && <input type="hidden" {...form.register("id")} value={(event?.id as string) ?? ""} />}

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

              <FormField
                control={typedControl}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Make this event public</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow anyone with the link to view event details and register
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {(isPublicValue || slugValue) && (
                <FormField
                  control={typedControl}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Public Slug</FormLabel>
                      <FormDescription>This text becomes part of the link you share with attendees.</FormDescription>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <FormControl>
                          <Input
                            {...field}
                            value={(field.value as string | undefined) ?? ""}
                            placeholder={slugSuggestion || "fundraising-gala"}
                            onChange={(event) => {
                              form.clearErrors("slug");
                              field.onChange(event.target.value);
                            }}
                            onBlur={(event) => {
                              field.onBlur();
                              const sanitized = generateSlug(event.target.value);
                              if (sanitized !== field.value) {
                                form.setValue("slug", sanitized, { shouldDirty: true, shouldValidate: true });
                              }
                            }}
                          />
                        </FormControl>
                        {slugSuggestion && slugSuggestion !== normalizedSlug && (
                          <Button type="button" variant="outline" size="sm" onClick={handleApplySlugSuggestion}>
                            Use suggestion
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isPublicValue && normalizedSlug && (
                <div className="sm:col-span-2 rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900">Public Registration Link</p>
                      <p className="mt-1 text-sm text-green-700 break-all">
                        {publicRegistrationUrl || "Link will be available once the app knows your domain."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Linked Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Search for existing contacts and assign event-specific roles.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add contact
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search contacts by name or email..."
                          value={contactSearchTerm}
                          onValueChange={setContactSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {debouncedContactSearch.length < 2
                              ? "Type at least two characters to search."
                              : isContactSearchLoading
                              ? "Searching..."
                              : "No contacts found."}
                          </CommandEmpty>
                          <CommandGroup heading="Contacts">
                            {contactSearchResults.map((contact) => {
                              const isSelected = isContactSelected(contact.id);
                              return (
                                <CommandItem
                                  key={contact.id}
                                  disabled={isSelected}
                                  onSelect={() => handleAddContact(contact)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{contact.name}</span>
                                    {contact.email && (
                                      <span className="text-xs text-muted-foreground break-all">
                                        {contact.email}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <Check className="ml-auto h-4 w-4 text-green-600" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">
                    Search your CRM and link contacts to this event.
                  </p>
                </div>

                {availableRoles.length === 0 && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    No event roles configured. Visit Settings to create event roles like &quot;Partner&quot;, &quot;Musician&quot;, etc.
                  </div>
                )}

                {selectedContacts.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No contacts linked yet. Use &quot;Add contact&quot; to search by name or email.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedContacts.map((selected) => {
                      const contact = contactLookup[selected.contactId];
                      const selectedRoleIds = contactRoles[selected.contactId] || [];

                      return (
                        <div
                          key={selected.contactId}
                          className="space-y-3 rounded-md border bg-muted/30 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {contact?.name ?? "Unknown contact"}
                              </p>
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                {contact?.email && <p className="break-all">{contact.email}</p>}
                                {contact?.phone && <p>{contact.phone}</p>}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveContact(selected.contactId)}
                              aria-label="Remove contact"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {availableRoles.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Roles
                              </p>
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
                                      onClick={() => handleRoleToggle(selected.contactId, role.id)}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => console.log("Submit button clicked", { isSubmitting, errors: formState.errors })}
            >
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
