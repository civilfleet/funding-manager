"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/FormInputControl";
import { createOrganizationSchema } from "@/validations/organizations";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createOrganizationSchema>>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      taxExemptionCertificate: "",
      taxID: "",
      bankDetails: {
        bankName: "",
        account_holder: "",
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

  async function onSubmit(values: z.infer<typeof createOrganizationSchema>) {
    try {
      console.log("values,,", values);
      // call for the api
      const response = await fetch("/api/organizations", {
        method: "POST",
        body: JSON.stringify(values),
      });

      // check for error
      if (response.status == 400) {
        toast({
          title: "Error",
          description: response.statusText,
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      console.log("data", data);
      toast({
        title: "Success",
        description: "Organization has been created",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: JSON.stringify(e),
      });
    }
  }
  return (
    <Form {...form}>
      <h2 className="text-2xl font-semibold">Create Organization</h2>

      <hr className="my-4" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormInputControl
            form={form}
            name="name"
            placeholder="Organization name"
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
          <FormInputControl form={form} name="country" placeholder="Country" />
          <FormInputControl
            form={form}
            name="postalCode"
            placeholder="Postal code"
          />
          <FormInputControl form={form} name="website" placeholder="Website" />
        </div>
        <h4 className="text-lg font-semibold">
          Tax Information
          <hr />
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <FormInputControl form={form} name="taxID" placeholder="Tax ID" />
          <FormInputControl
            form={form}
            name="taxExemptionCertificate"
            placeholder="Tax exemption certificate"
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
            name="bankDetails.account_holder"
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
          <FormInputControl
            form={form}
            name="contactPerson.postalCode"
            placeholder="Contact person postal code"
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
