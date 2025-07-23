"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/form-input-control";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import ButtonControl from "../helper/button-control";
import { createTeamSchema } from "@/validations/team";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TeamFormProps {
  team?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
    website: string | null;
    bankDetails?: {
      bankName: string | null;
      accountHolder: string | null;
      iban: string | null;
      bic: string | null;
    } | null;
    users?: {
      name: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    }[];
  };
}

export default function TeamForm({ team }: TeamFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      user: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },
    },
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name || "",
        email: team.email || "",
        phone: team.phone || "",
        address: team.address || "",
        city: team.city || "",
        country: team.country || "",
        postalCode: team.postalCode || "",
        website: team.website || "",
        user: {
          name: team.users?.[0]?.name || "",
          email: team.users?.[0]?.email || "",
          phone: team.users?.[0]?.phone || "",
          address: team.users?.[0]?.address || "",
        },
      });
    }
  }, [team, form]);

  async function onSubmit(values: z.infer<typeof createTeamSchema>) {
    try {
      const url = team ? `/api/teams/${team.id}` : "/api/teams";
      const method = team ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || response.statusText,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: team ? "Team information updated" : "Team information created",
        variant: "default",
      });

      if (!team) {
        // Redirect to the newly created team
        router.push(`/teams/${data.id}`);
      } else {
        router.refresh();
      }
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
        <CardTitle>{team ? "Edit Team" : "Create New Team"}</CardTitle>
        <CardDescription>{team ? "Update team information below" : "Please create a new team below"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="Team-form">
            <div className="grid grid-cols-2 gap-4">
              <FormInputControl form={form} name="name" placeholder="Team name" />
              <FormInputControl form={form} name="email" placeholder="Email address" />
              <FormInputControl form={form} name="phone" placeholder="Phone number" />
              <FormInputControl form={form} name="address" placeholder="Street address" />

              <FormInputControl form={form} name="city" placeholder="City" />
              <FormInputControl form={form} name="country" placeholder="Country" />
              <FormInputControl form={form} name="postalCode" placeholder="Postal code" />
              <FormInputControl form={form} name="website" placeholder="Website" />
            </div>

            <h4 className="text-lg font-semibold">
              User Person
              <hr />
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormInputControl form={form} name="user.name" placeholder="User person name" />
              <FormInputControl form={form} name="user.email" placeholder="User person email" />
              <FormInputControl form={form} name="user.phone" placeholder="User person phone" />
              <FormInputControl form={form} name="user.address" placeholder="User person address" />
            </div>

            <ButtonControl className="w-24" type="submit" disabled={form.formState.isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
