"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

import { createContactSchema } from "@/validations/contacts";
import { ContactAttributeType } from "@/types";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactFormValues = z.infer<typeof createContactSchema>;

interface ContactFormProps {
  teamId: string;
}

export default function ContactForm({ teamId }: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      teamId,
      name: "",
      email: "",
      phone: "",
      profileAttributes: [],
    },
  });

  useEffect(() => {
    form.setValue("teamId", teamId);
  }, [teamId, form]);

  const { control, watch, setValue } = form;

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
    []
  );

  const attributes = watch("profileAttributes");

  const handleTypeChange = (index: number, type: ContactAttributeType) => {
    let initialValue: ContactFormValues["profileAttributes"][number]["value"];

    switch (type) {
      case ContactAttributeType.LOCATION:
        initialValue = { label: "", latitude: undefined, longitude: undefined } as ContactFormValues["profileAttributes"][number]["value"];
        break;
      default:
        initialValue = "" as ContactFormValues["profileAttributes"][number]["value"];
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
    } as ContactFormValues["profileAttributes"][number]);
  };

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to create contact");
      }

      toast({
        title: "Contact created",
        description: `${values.name} has been added to your CRM contacts.`,
      });

      router.push(`/teams/${teamId}/contacts`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Unable to create contact",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
            control={control}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      typeof field.value === "string" || typeof field.value === "number"
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
            control={control}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={
                      typeof field.value === "number" || typeof field.value === "string"
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
              control={control}
              name={`profileAttributes.${index}.value.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Office"
                      {...field}
                      value={
                        typeof field.value === "string" || typeof field.value === "number"
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
              control={control}
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
                        typeof field.value === "number" || typeof field.value === "string"
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
              control={control}
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
                        typeof field.value === "number" || typeof field.value === "string"
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
            control={control}
            name={`profileAttributes.${index}.value`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter value"
                    {...field}
                    value={
                      typeof field.value === "string" || typeof field.value === "number"
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
        <CardTitle className="text-xl font-semibold">Add Contact</CardTitle>
        <CardDescription>Create a contact record with flexible CRM attributes.</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...form.register("teamId")} value={teamId} />
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Johnson" {...field} value={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="alex@example.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">Profile attributes</h3>
                  <p className="text-sm text-muted-foreground">Capture structured CRM data such as roles, regions, or lifecycle dates.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
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
                  const currentType = attributes?.[index]?.type ?? ContactAttributeType.STRING;
                  return (
                    <div key={field.id} className="rounded-md border p-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-5">
                        <FormField
                          control={control}
                          name={`profileAttributes.${index}.key`}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Label *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Relationship" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`profileAttributes.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value: ContactAttributeType) => {
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
                                    <SelectItem key={option.value} value={option.value}>
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
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
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
