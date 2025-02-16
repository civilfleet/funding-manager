"use client";

import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import ButtonControl from "../helper/ButtonControl";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/FormInputControl";
import { createContactSchema } from "@/validations/organizations";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

export default function ContactForm() {
  const form = useForm<z.infer<typeof createContactSchema>>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      country: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createContactSchema>) {
    try {
      const response = await fetch("/api/contact-person", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: response?.statusText,
          variant: "destructive",
        });
        return;
      }
      await response.json();

      toast({
        title: "Success",
        description: "Contact created successfully",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Contact</CardTitle>
        <CardDescription>
          Fill in the form below to create a new contact person
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4 ">
              <FormInputControl
                form={form}
                name="name"
                placeholder="Contact person name"
                type="text"
              />
              <FormInputControl
                form={form}
                name="email"
                placeholder="Contact person email"
                type="text"
              />
              <FormInputControl
                form={form}
                name="phone"
                placeholder="Contact person phone"
                type="text"
              />
              <FormInputControl
                form={form}
                name="address"
                placeholder="Contact person address"
                type="text"
              />
              <FormInputControl
                form={form}
                name="postalCode"
                placeholder="Contact person postal code"
                type="text"
              />
              <FormInputControl
                form={form}
                name="city"
                placeholder="Contact person city"
                type="text"
              />
              <FormInputControl
                form={form}
                name="country"
                placeholder="Contact person country"
                type="text"
              />
            </div>

            <ButtonControl
              type={"submit"}
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
