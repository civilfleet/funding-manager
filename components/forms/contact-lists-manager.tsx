"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  List as ListIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { createContactListSchema } from "@/validations/contact-lists";

type ContactList = {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  contacts: Array<{
    id: string;
    name: string;
    email: string | null;
  }>;
};

type Contact = {
  id: string;
  name: string;
  email: string | null;
};

type FormValues = z.infer<typeof createContactListSchema>;

interface ContactListsManagerProps {
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContactListsManager({
  teamId,
}: ContactListsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingList, setEditingList] = useState<ContactList | null>(null);

  const { data: listsData, mutate } = useSWR(
    `/api/contact-lists?teamId=${teamId}`,
    fetcher,
  );

  const { data: contactsData } = useSWR(
    `/api/teams/${teamId}/contacts`,
    fetcher,
  );

  const lists: ContactList[] = useMemo(() => {
    return (listsData?.data || []).sort((a: ContactList, b: ContactList) =>
      a.name.localeCompare(b.name),
    );
  }, [listsData]);

  const contacts: Contact[] = contactsData?.data || [];

  const form = useForm({
    resolver: zodResolver(createContactListSchema),
    defaultValues: {
      teamId,
      name: "",
      description: "",
      contactIds: [] as string[],
    },
  });

  const typedControl =
    form.control as unknown as import("react-hook-form").Control<FormValues>;

  const handleOpenDialog = (list?: ContactList) => {
    if (list) {
      setEditingList(list);
      form.reset({
        teamId,
        name: list.name,
        description: list.description || "",
        contactIds: list.contacts?.map((c) => c.id) || [],
      });
    } else {
      setEditingList(null);
      form.reset({
        teamId,
        name: "",
        description: "",
        contactIds: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingList(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (editingList) {
        // Update list basic info
        const updateResponse = await fetch(
          `/api/contact-lists/${editingList.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: values.teamId,
              name: values.name,
              description: values.description,
            }),
          },
        );

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to update list");
        }

        // Update list contacts
        const existingContactIds = editingList.contacts?.map((c) => c.id) || [];
        const newContactIds = values.contactIds || [];

        const contactsToAdd = newContactIds.filter(
          (id) => !existingContactIds.includes(id),
        );
        const contactsToRemove = existingContactIds.filter(
          (id) => !newContactIds.includes(id),
        );

        // Add new contacts
        if (contactsToAdd.length > 0) {
          const addResponse = await fetch(
            `/api/contact-lists/${editingList.id}/contacts`,
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
            throw new Error(
              errorBody.error || "Failed to add contacts to list",
            );
          }
        }

        // Remove contacts
        if (contactsToRemove.length > 0) {
          const removeResponse = await fetch(
            `/api/contact-lists/${editingList.id}/contacts`,
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
            throw new Error(
              errorBody.error || "Failed to remove contacts from list",
            );
          }
        }
      } else {
        // Create new list
        const response = await fetch("/api/contact-lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to create list");
        }
      }

      toast({
        title: editingList ? "List updated" : "List created",
        description: `${values.name} has been ${
          editingList ? "updated" : "created"
        }.`,
      });

      mutate();
      handleCloseDialog();
      router.refresh();
    } catch (error) {
      toast({
        title: `Unable to ${editingList ? "update" : "create"} list`,
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (listId: string, listName: string) => {
    if (!confirm(`Are you sure you want to delete the list "${listName}"?`)) {
      return;
    }

    try {
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
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Lists</CardTitle>
              <CardDescription>
                Create and manage lists to organize your contacts
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add List
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {lists.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No lists created yet. Create your first list to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{list.name}</h3>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        {list.contactCount}{" "}
                        {list.contactCount === 1 ? "contact" : "contacts"}
                      </Badge>
                    </div>
                    {list.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {list.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(list)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(list.id, list.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingList ? "Edit List" : "Create List"}
            </DialogTitle>
            <DialogDescription>
              {editingList
                ? "Update the list name, description, and contacts."
                : "Create a new list and assign contacts to it."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={typedControl}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Newsletter Subscribers, Event Attendees"
                        {...field}
                        value={field.value}
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
                        placeholder="Describe the purpose of this list"
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
                name="contactIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Contacts</FormLabel>
                    <FormDescription>
                      Select contacts to include in this list
                    </FormDescription>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {contacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No contacts available
                        </p>
                      ) : (
                        contacts.map((contact) => (
                          <FormField
                            key={contact.id}
                            control={typedControl}
                            name="contactIds"
                            render={({ field }) => (
                              <FormItem
                                key={contact.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
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
                                    <span className="text-muted-foreground text-sm ml-2">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingList ? "Updating" : "Creating"}
                    </>
                  ) : editingList ? (
                    "Update List"
                  ) : (
                    "Create List"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
