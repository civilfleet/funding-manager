"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/form-input-control";

import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import ButtonControl from "../helper/button-control";
import { createTeamSchema } from "@/validations/team";

export default function TeamForm() {
  const { toast } = useToast();

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
      roleName: "",
      bankDetails: {
        bankName: "",
        accountHolder: "",
        iban: "",
        bic: "",
      },
      contactPerson: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof createTeamSchema>) {
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
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
        description: "Team information created",
        variant: "default",
      });
      form.reset();
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
        <CardTitle>Create New Team</CardTitle>
        <CardDescription>Please create a new team below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            id="Team-form"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormInputControl
                form={form}
                name="name"
                placeholder="Team name"
              />
              <FormInputControl
                form={form}
                name="email"
                placeholder="Email address"
              />
              <FormInputControl
                form={form}
                name="phone"
                placeholder="Phone number"
              />
              <FormInputControl
                form={form}
                name="address"
                placeholder="Street address"
              />

              <FormInputControl form={form} name="city" placeholder="City" />
              <FormInputControl
                form={form}
                name="country"
                placeholder="Country"
              />
              <FormInputControl
                form={form}
                name="postalCode"
                placeholder="Postal code"
              />
              <FormInputControl
                form={form}
                name="website"
                placeholder="Website"
              />
              <FormInputControl
                form={form}
                name="roleName"
                placeholder="Role Name: Starts with 'fm-'"
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold">Bank Details</h4>
              <hr />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInputControl
                form={form}
                name="bankDetails.bankName"
                placeholder="Bank name"
              />
              <FormInputControl
                form={form}
                name="bankDetails.accountHolder"
                placeholder="Account holder"
              />
              <FormInputControl
                form={form}
                name="bankDetails.iban"
                placeholder="IBAN"
              />
              <FormInputControl
                form={form}
                name="bankDetails.bic"
                placeholder="SWIFT"
              />
            </div>
            <h4 className="text-lg font-semibold">
              Contact Person
              <hr />
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormInputControl
                form={form}
                name="contactPerson.name"
                placeholder="Contact person name"
              />
              <FormInputControl
                form={form}
                name="contactPerson.email"
                placeholder="Contact person email"
              />
              <FormInputControl
                form={form}
                name="contactPerson.phone"
                placeholder="Contact person phone"
              />
              <FormInputControl
                form={form}
                name="contactPerson.address"
                placeholder="Contact person address"
              />
            </div>

            <ButtonControl
              className="w-24"
              type="submit"
              disabled={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
