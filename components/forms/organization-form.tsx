"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/FormInputControl";
import { createOrganizationSchema } from "@/validations/organizations";
import { useToast } from "@/hooks/use-toast";
import { useTeamStore } from "@/store/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Loader } from "../helper/Loader";
import ButtonControl from "../helper/ButtonControl";

type Organization = {
  name?: string;
  email: string;
  address?: string;
  x?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  postalCode?: string;
  taxExemptionCertificate?: string;
  taxID?: string;
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
};
export default function OrganizationForm({ data }: { data: Organization }) {
  const { toast } = useToast();
  const { team } = useTeamStore();

  const form = useForm<z.infer<typeof createOrganizationSchema>>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      email: data?.email || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      city: data?.city || "",
      country: data?.country || "",
      postalCode: data?.postalCode || "",
      website: data?.website || "",
      taxExemptionCertificate: data?.taxExemptionCertificate || "",
      taxID: data?.taxID || "",
      bankDetails: {
        bankName: data?.bankDetails?.bankName || "",
        accountHolder: data?.bankDetails?.accountHolder || "",
        iban: data?.bankDetails?.iban || "",
        bic: data?.bankDetails?.bic || "",
      },
      contactPerson: {
        name: data?.contactPerson?.name || "",
        email: data?.contactPerson?.email || "",
        phone: data?.contactPerson?.phone || "",
        address: data?.contactPerson?.address || "",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof createOrganizationSchema>) {
    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        body: JSON.stringify({ ...values, teamId: team.id }),
      });

      if (!data.email) {
        const response = await fetch("/api/organization", {
          method: "POST",
          body: JSON.stringify({ ...values, teamId: team.id }),
        });
      } else {
        const response = await fetch("/api/organization", {
          method: "PUT",
          body: JSON.stringify({ ...values }),
        });
      }

      // check for error
      if (response.status == 400) {
        toast({
          title: "Error",
          description: response.statusText,
          variant: "destructive",
        });
        return;
      }
      await response.json();
      toast({
        title: "Success",
        description: "Organization information updated",
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Organization Information</CardTitle>
        <CardDescription>
          Please update your organization information below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <FormInputControl
                form={form}
                name="name"
                placeholder="Organization name"
              />
              <FormInputControl
                form={form}
                disabled={data?.email ? true : false}
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
              <FormInputControl
                form={form}
                name="contactPerson.postalCode"
                placeholder="Contact person postal code"
              />
            </div>
            <ButtonControl
              className="w-24"
              type="submit"
              loading={form.formState.isSubmitting}
              label="Save"
              variant={"default"}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button variant="outline">Cancel</Button>
  <Button>Deploy</Button> */}
      </CardFooter>
    </Card>
  );
}
