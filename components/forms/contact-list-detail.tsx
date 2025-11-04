"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { createContactListSchema } from "@/validations/contact-lists";

type Contact = {
  id: string;
  name: string;
  email: string | null;
};

type ContactList = {
  id: string;
  name: string;
  description?: string | null;
  contacts: Contact[];
};

type FormValues = z.input<typeof createContactListSchema>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContactListDetailProps {
  teamId: string;
  listId: string;
}

export function ContactListDetail({ teamId, listId }: ContactListDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const isNewList = listId === "new";
  const listKey = isNewList
    ? null
    : `/api/contact-lists/${listId}?teamId=${teamId}`;

  const {
    data: listData,
    mutate: mutateList,
    isLoading: isLoadingList,
  } = useSWR(listKey, fetcher, {
    revalidateOnFocus: false,
  });

  const contactQueryParam = debouncedQuery.trim()
    ? `&query=${encodeURIComponent(debouncedQuery.trim())}`
    : "";
  const contactsKey = `/api/contacts?teamId=${teamId}${contactQueryParam}`;

  const {
    data: contactsData,
    isValidating: isLoadingContacts,
  } = useSWR(contactsKey, fetcher, {
    keepPreviousData: true,
  });

  const list: ContactList | undefined = listData?.data;
  const contacts: Contact[] = useMemo(
    () => contactsData?.data || [],
    [contactsData],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(createContactListSchema),
    defaultValues: {
      teamId,
      name: "",
      description: "",
      contactIds: [],
    },
  });

  const typedControl =
    form.control as unknown as import("react-hook-form").Control<FormValues>;

  const existingContactIds = useMemo(
    () => new Set(list?.contacts?.map((contact) => contact.id) || []),
    [list],
  );

  useEffect(() => {
    if (isNewList) {
      form.reset({
        teamId,
        name: "",
        description: "",
        contactIds: [],
      });
      return;
    }

    if (!list) {
      return;
    }

    form.reset({
      teamId,
      name: list.name,
      description: list.description || "",
      contactIds: list.contacts?.map((contact) => contact.id) || [],
    });
  }, [form, list, teamId, isNewList]);

  const handleRemoveContact = async (contactId: string) => {
    if (!list) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/contact-lists/${list.id}/contacts`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamId,
            contactIds: [contactId],
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to remove contact");
      }

      await mutateList();
      const currentContactIds = form.getValues("contactIds") || [];
      form.setValue(
        "contactIds",
        currentContactIds.filter((id) => id !== contactId),
      );
      toast({
        title: "Contact removed",
        description: "The contact was removed from the list.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove contact",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (isNewList) {
        const createResponse = await fetch("/api/contact-lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!createResponse.ok) {
          const errorBody = await createResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to create list");
        }

        const { data } = await createResponse.json();
        toast({
          title: "List created",
          description: `${values.name} has been created.`,
        });
        router.push(`/teams/${teamId}/lists/${data.id}`);
        router.refresh();
        return;
      }

      if (!list) {
        throw new Error("List not found");
      }

      const updateResponse = await fetch(`/api/contact-lists/${list.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: values.teamId,
          name: values.name,
          description: values.description,
        }),
      });

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to update list");
      }

      const newContactIds = values.contactIds || [];
      const contactsToAdd = newContactIds.filter(
        (id) => !existingContactIds.has(id),
      );

      const contactsToRemove = [...existingContactIds].filter(
        (id) => !newContactIds.includes(id),
      );

      if (contactsToAdd.length > 0) {
        const addResponse = await fetch(
          `/api/contact-lists/${list.id}/contacts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: values.teamId,
              contactIds: contactsToAdd,
            }),
          },
        );

        if (!addResponse.ok) {
          const errorBody = await addResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to add contacts");
        }
      }

      if (contactsToRemove.length > 0) {
        const removeResponse = await fetch(
          `/api/contact-lists/${list.id}/contacts`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: values.teamId,
              contactIds: contactsToRemove,
            }),
          },
        );

        if (!removeResponse.ok) {
          const errorBody = await removeResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to remove contacts");
        }
      }

      await mutateList();
      toast({
        title: "List updated",
        description: "Changes have been saved.",
      });
    } catch (error) {
      toast({
        title: isNewList ? "Failed to create list" : "Failed to update list",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isNewList && isLoadingList) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isNewList && !list) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>List not found</CardTitle>
          <CardDescription>
            The requested list could not be located. It may have been deleted or
            you may not have access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/teams/${teamId}/lists`}>Back to Lists</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const headerTitle = isNewList ? "Create contact list" : list?.name ?? "";
  const headerDescription = isNewList
    ? "Set up the name, description, and members for this contact list."
    : list?.description ?? "";
  const selectedCount = form.watch("contactIds")?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{headerTitle}</h1>
          {headerDescription && (
            <p className="mt-1 text-muted-foreground">{headerDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNewList && (
            <Badge variant="secondary">
              {list?.contacts.length ?? 0} contacts
            </Badge>
          )}
          <Button asChild variant="outline">
            <Link href={`/teams/${teamId}/lists`}>Back to Lists</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isNewList ? "List details" : "Edit list details"}
          </CardTitle>
          <CardDescription>
            {isNewList
              ? "Give your list a name, optional description, and choose contacts to include."
              : "Update the list name, description, and membership in a single place."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={typedControl}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Quarterly Newsletter"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this contact list"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="contactIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Contacts</FormLabel>
                    <FormDescription>
                      Search and select contacts to include in this list.
                    </FormDescription>
                    <Input
                      className="mt-2"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search contacts by name or email"
                    />
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 mt-2">
                      {isLoadingContacts && contacts.length === 0 ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading contacts...
                        </div>
                      ) : contacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {debouncedQuery.trim()
                            ? "No contacts match your search"
                            : "No contacts available"}
                        </p>
                      ) : (
                        contacts.map((contact) => (
                          <FormField
                            key={contact.id}
                            control={typedControl}
                            name="contactIds"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(contact.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...(field.value || []),
                                          contact.id,
                                        ]);
                                        return;
                                      }

                                      field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== contact.id,
                                        ),
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {contact.name}
                                  {contact.email && (
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      ({contact.email})
                                    </span>
                                  )}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))
                      )}
                    </div>
                    <FormDescription className="text-xs text-muted-foreground">
                      {selectedCount} contact
                      {selectedCount === 1 ? "" : "s"} selected.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset({
                      teamId,
                      name: isNewList ? "" : list?.name ?? "",
                      description: isNewList ? "" : list?.description || "",
                      contactIds: isNewList
                        ? []
                        : list?.contacts?.map((contact) => contact.id) || [],
                    });
                  }}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isNewList ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isNewList ? "Create List" : "Save Changes"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {!isNewList && (
        <Card>
          <CardHeader>
            <CardTitle>Current contacts</CardTitle>
            <CardDescription>
              These contacts are currently part of the list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {list?.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts are assigned to this list yet.
              </p>
            ) : (
              <div className="space-y-3">
                {list?.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      {contact.email && (
                        <p className="text-sm text-muted-foreground">
                          {contact.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContact(contact.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove contact</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
