"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2, Users } from "lucide-react";
import useSWR from "swr";

import { createGroupSchema } from "@/validations/groups";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type Group = {
  id: string;
  name: string;
  description?: string;
  canAccessAllContacts: boolean;
  users?: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

type FormValues = z.infer<typeof createGroupSchema>;

interface GroupsManagerProps {
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupsManager({ teamId }: GroupsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const { data: groupsData, mutate } = useSWR(
    `/api/groups?teamId=${teamId}`,
    fetcher
  );

  const { data: usersData } = useSWR(
    `/api/teams/${teamId}/users`,
    fetcher
  );

  const groups: Group[] = groupsData?.data || [];
  const users: User[] = usersData?.data || [];

  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      teamId,
      name: "",
      description: "",
      canAccessAllContacts: false,
      userIds: [] as string[],
    },
  });

  const typedControl = form.control as unknown as import("react-hook-form").Control<FormValues>;

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      form.reset({
        teamId,
        name: group.name,
        description: group.description || "",
        canAccessAllContacts: group.canAccessAllContacts,
        userIds: group.users?.map(u => u.userId) || [],
      });
    } else {
      setEditingGroup(null);
      form.reset({
        teamId,
        name: "",
        description: "",
        canAccessAllContacts: false,
        userIds: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (editingGroup) {
        // Update group basic info
        const updateResponse = await fetch(`/api/groups/${editingGroup.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamId: values.teamId,
            name: values.name,
            description: values.description,
            canAccessAllContacts: values.canAccessAllContacts,
          }),
        });

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to update group");
        }

        // Update group users
        const existingUserIds = editingGroup.users?.map(u => u.userId) || [];
        const newUserIds = values.userIds || [];

        const usersToAdd = newUserIds.filter(id => !existingUserIds.includes(id));
        const usersToRemove = existingUserIds.filter(id => !newUserIds.includes(id));

        // Add new users
        if (usersToAdd.length > 0) {
          const addResponse = await fetch(`/api/groups/${editingGroup.id}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: values.teamId,
              userIds: usersToAdd,
            }),
          });

          if (!addResponse.ok) {
            const errorBody = await addResponse.json().catch(() => ({}));
            throw new Error(errorBody.error || "Failed to add users to group");
          }
        }

        // Remove users
        if (usersToRemove.length > 0) {
          const removeResponse = await fetch(`/api/groups/${editingGroup.id}/users`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: values.teamId,
              userIds: usersToRemove,
            }),
          });

          if (!removeResponse.ok) {
            const errorBody = await removeResponse.json().catch(() => ({}));
            throw new Error(errorBody.error || "Failed to remove users from group");
          }
        }
      } else {
        // Create new group
        const response = await fetch("/api/groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to create group");
        }
      }

      toast({
        title: editingGroup ? "Group updated" : "Group created",
        description: `${values.name} has been ${
          editingGroup ? "updated" : "created"
        }.`,
      });

      mutate();
      handleCloseDialog();
      router.refresh();
    } catch (error) {
      toast({
        title: `Unable to ${editingGroup ? "update" : "create"} group`,
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/groups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          ids: [groupId],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to delete group");
      }

      toast({
        title: "Group deleted",
        description: `${groupName} has been removed.`,
      });

      mutate();
      router.refresh();
    } catch (error) {
      toast({
        title: "Unable to delete group",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
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
              <CardTitle>Groups</CardTitle>
              <CardDescription>
                Manage groups to control which users can access specific contacts
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {groups.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No groups configured yet. Create your first group to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{group.name}</h3>
                      {group.users && group.users.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.users.length} {group.users.length === 1 ? "user" : "users"}
                        </Badge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(group.id, group.name)}
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
              {editingGroup ? "Edit Group" : "Create Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update the group name, description, and members."
                : "Create a new group and assign users to it."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={typedControl}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Finance Team, West Region"
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
                        placeholder="Describe the purpose of this group"
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
                name="canAccessAllContacts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Can access all contacts
                      </FormLabel>
                      <FormDescription>
                        Users in this group will be able to see all contacts, regardless of their group assignment
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="userIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Group Members</FormLabel>
                    <FormDescription>
                      Select users who should be part of this group
                    </FormDescription>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No users available</p>
                      ) : (
                        users.map((user) => (
                          <FormField
                            key={user.id}
                            control={typedControl}
                            name="userIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={user.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), user.id])
                                          : field.onChange(
                                              (field.value || []).filter(
                                                (value) => value !== user.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {user.name || user.email}
                                    {user.name && (
                                      <span className="text-muted-foreground text-sm ml-2">
                                        ({user.email})
                                      </span>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
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
                      {editingGroup ? "Updating" : "Creating"}
                    </>
                  ) : editingGroup ? (
                    "Update Group"
                  ) : (
                    "Create Group"
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
