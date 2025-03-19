"use client";

import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import ButtonControl from "../helper/button-control";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/form-input-control";
import { createUserSchema } from "@/validations/organizations";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { useTeamStore } from "@/store/store";

export default function UserForm() {
  const { teamId } = useTeamStore();
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
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

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    try {
      const response = await fetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({ ...values, teamId }),
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
        description: "User created successfully",
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
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Fill in the form below to create a new user person
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4 ">
              <FormInputControl
                form={form}
                name="name"
                placeholder="User person name"
                type="text"
              />
              <FormInputControl
                form={form}
                name="email"
                placeholder="User person email"
                type="text"
              />
              <FormInputControl
                form={form}
                name="phone"
                placeholder="User person phone"
                type="text"
              />
              <FormInputControl
                form={form}
                name="address"
                placeholder="User person address"
                type="text"
              />
              <FormInputControl
                form={form}
                name="postalCode"
                placeholder="User person postal code"
                type="text"
              />
              <FormInputControl
                form={form}
                name="city"
                placeholder="User person city"
                type="text"
              />
              <FormInputControl
                form={form}
                name="country"
                placeholder="User person country"
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
