"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { type Contact, ContactAttributeType } from "@/types";
import {
  createContactSchema,
  updateContactSchema,
} from "@/validations/contacts";

type CreateContactFormValues = z.infer<typeof createContactSchema>;
type UpdateContactFormValues = z.infer<typeof updateContactSchema>;
type ContactFormValues = CreateContactFormValues | UpdateContactFormValues;

type Group = {
  id: string;
  name: string;
};

interface ContactFormProps {
  teamId: string;
  contact?: Contact;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContactForm({ teamId, contact }: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(contact);

  const { data: groupsData } = useSWR(`/api/groups?teamId=${teamId}`, fetcher);

  const groups: Group[] = groupsData?.data || [];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(
      isEditMode ? updateContactSchema : createContactSchema,
    ) as import("react-hook-form").Resolver<ContactFormValues>,
    defaultValues: isEditMode
      ? {
          teamId,
          contactId: contact?.id ?? "",
          name: contact?.name ?? "",
          email: contact?.email ?? "",
          phone: contact?.phone ?? "",
          groupId: contact?.groupId ?? undefined,
          profileAttributes: (contact?.profileAttributes ??
            []) as CreateContactFormValues["profileAttributes"],
        }
      : {
          teamId,
          name: "",
          email: "",
          phone: "",
          groupId: undefined,
          profileAttributes: [] as CreateContactFormValues["profileAttributes"],
        },
  });

  useEffect(() => {
    form.setValue("teamId", teamId);
  }, [teamId, form]);

  const { control, watch, setValue } = form;
  const typedControl =
    control as unknown as import("react-hook-form").Control<CreateContactFormValues>;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "profileAttributes",
  });

  const attributeTypes = useMemo(
    () => [
      { label: "Text", value: ContactAttributeType.STRING },
      { label: "Date", value: ContactAttributeType.DATE },
      { label: "Number", value: ContactAttributeType.NUMBER },
      { label: "Location", value: ContactAttributeType.LOCATION },
    ],
    [],
  );

  const attributes = watch("profileAttributes");

  const handleTypeChange = (index: number, type: ContactAttributeType) => {
    let initialValue: CreateContactFormValues["profileAttributes"][number]["value"];

    switch (type) {
      case ContactAttributeType.LOCATION:
        initialValue = {
          label: "",
          latitude: undefined,
          longitude: undefined,
        } as CreateContactFormValues["profileAttributes"][number]["value"];
        break;
      default:
        initialValue =
          "" as CreateContactFormValues["profileAttributes"][number]["value"];
        break;
    }

    setValue(`profileAttributes.${index}.value`, initialValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const addAttribute = () => {
    append({
      key: "",
      type: ContactAttributeType.STRING,
      value: "",
    } as CreateContactFormValues["profileAttributes"][number]);
  };

  const onSubmit = async (
    values: ContactFormValues,
    shouldExit: boolean = true,
  ) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contacts", {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.error ||
            `Failed to ${isEditMode ? "update" : "create"} contact`,
        );
      }

      toast({
        title: isEditMode ? "Contact updated" : "Contact created",
        description: isEditMode
          ? `${values.name} has been successfully updated.`
          : `${values.name} has been added to your CRM contacts.`,
      });

      if (shouldExit) {
        if (isEditMode && contact?.id) {
          router.push(`/teams/${teamId}/contacts/${contact.id}`);
        } else {
          router.push(`/teams/${teamId}/contacts`);
        }
      }
      router.refresh();
    } catch (error) {
      toast({
        title: isEditMode
          ? "Unable to update contact"
          : "Unable to create contact",
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

  const renderValueField = (index: number, type: ContactAttributeType) => {
    switch (type) {
      case ContactAttributeType.DATE:
        return (
          <FormField
            control={typedControl}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      typeof field.value === "string" ||
                      typeof field.value === "number"
                        ? field.value
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case ContactAttributeType.NUMBER:
        return (
          <FormField
            control={typedControl}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={
                      typeof field.value === "number" ||
                      typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case ContactAttributeType.LOCATION:
        return (
          <div className="grid gap-3 sm:grid-cols-3 sm:col-span-3">
            <FormField
              control={typedControl}
              name={`profileAttributes.${index}.value.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Office"
                      {...field}
                      value={
                        typeof field.value === "string" ||
                        typeof field.value === "number"
                          ? field.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedControl}
              name={`profileAttributes.${index}.value.latitude`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedControl}
              name={`profileAttributes.${index}.value.longitude`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return (
          <FormField
            control={typedControl}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter value"
                    {...field}
                    value={
                      typeof field.value === "string" ||
                      typeof field.value === "number"
                        ? field.value
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl font-semibold">
          {isEditMode ? "Edit Contact" : "Add Contact"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update contact information and CRM attributes."
            : "Create a contact record with flexible CRM attributes."}
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <input type="hidden" {...form.register("teamId")} value={teamId} />
          {isEditMode && (
            <input
              type="hidden"
              {...form.register("contactId")}
              value={contact?.id}
            />
          )}
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={typedControl}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Alex Johnson"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="alex@example.com"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
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
                name="groupId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Group (optional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">
                    Profile attributes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Capture structured CRM data such as roles, regions, or
                    lifecycle dates.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add attribute
                </Button>
              </div>

              <div className="space-y-4">
                {fields.length === 0 && (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No attributes yet. Add one to capture additional context.
                  </div>
                )}

                {fields.map((field, index) => {
                  const currentType =
                    attributes?.[index]?.type ?? ContactAttributeType.STRING;
                  return (
                    <div
                      key={field.id}
                      className="rounded-md border p-4 space-y-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-5">
                        <FormField
                          control={typedControl}
                          name={`profileAttributes.${index}.key`}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Label *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Relationship"
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
                          name={`profileAttributes.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(
                                  value: ContactAttributeType,
                                ) => {
                                  field.onChange(value);
                                  handleTypeChange(index, value);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {attributeTypes.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end sm:col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => remove(index)}
                            aria-label="Remove attribute"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {renderValueField(index, currentType)}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={form.handleSubmit((values) => onSubmit(values, false))}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            )}
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={form.handleSubmit((values) => onSubmit(values, true))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : isEditMode ? (
                "Save & Exit"
              ) : (
                "Save contact"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
