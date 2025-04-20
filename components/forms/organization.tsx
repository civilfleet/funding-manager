"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/form-input-control";
import { createOrganizationSchema, updateOrganizationSchema } from "@/validations/organizations";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import ButtonControl from "../helper/button-control";
import Alert from "@/components/helper/alert";
import { useState } from "react";
import { useTeamStore } from "@/store/store";
import FileUpload from "../file-uploader";

type Organization = {
  id: string;
  name?: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  postalCode?: string;
  taxExemptionCertificate?: string;
  articlesOfAssociation?: string;
  taxID?: string;
  isFilledByOrg: boolean;
  logo?: string;
  Files?: {
    type: string;
    url: string;
    id: string;
  }[];
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  user?: {
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  teamId?: string;
};

export default function OrganizationForm({ data }: { data: Organization }) {
  const { toast } = useToast();
  const [isUpdate] = useState(data?.email ? true : false);
  const schema = isUpdate ? updateOrganizationSchema : createOrganizationSchema;

  // Helper function to check if a field is filled
  const isFieldFilled = (value: string | undefined): boolean => {
    return Boolean(value?.trim());
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: data?.email || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      city: data?.city || "",
      country: data?.country || "",
      postalCode: data?.postalCode || "",
      website: data?.website || "",
      taxExemptionCertificate: data?.Files?.find((file) => file.type === "TAX_EXEMPTION_CERTIFICATE")?.url || "",
      articlesOfAssociation: data?.Files?.find((file) => file.type === "ARTICLES_OF_ASSOCIATION")?.url || "",
      taxID: data?.taxID || "",
      logo: data?.Files?.find((file) => file.type === "LOGO")?.url || "",
      bankDetails: {
        bankName: data?.bankDetails?.bankName || "",
        accountHolder: data?.bankDetails?.accountHolder || "",
        iban: data?.bankDetails?.iban || "",
        bic: data?.bankDetails?.bic || "",
      },
      user: {
        name: data?.user?.name || "",
        email: data?.user?.email || "",
        phone: data?.user?.phone || "",
        address: data?.user?.address || "",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      let response;
      if (!data?.email) {
        response = await fetch("/api/organizations", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            teamId: data?.teamId,
            isFilledByOrg: false,
          }),
        });
      } else {
        response = await fetch("/api/organizations", {
          method: "PUT",
          body: JSON.stringify({ ...values, isFilledByOrg: true }),
        });
      }
      // check for error
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || response.statusText,
          variant: "destructive",
        });
        return;
      }
      await response.json();
      toast({
        title: "Success",
        description: isUpdate ? "Organization information updated" : "Organization information created",
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
        <CardTitle>Update Organization Information</CardTitle>
        <CardDescription>Please update your organization information below</CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset disabled={form.formState.isSubmitting}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="organization-form">
              <div className="grid grid-cols-2 gap-4">
                <FormInputControl
                  form={form}
                  name="name"
                  placeholder="Organization name"
                  isFilled={isFieldFilled(data?.name)}
                />
                <FormInputControl
                  form={form}
                  disabled={data?.email ? true : false}
                  name="email"
                  placeholder="Email address"
                  isFilled={isFieldFilled(data?.email)}
                />
                <FormInputControl
                  form={form}
                  name="phone"
                  placeholder="Phone number"
                  isFilled={isFieldFilled(data?.phone)}
                />
                <FormInputControl
                  form={form}
                  name="address"
                  placeholder="Street address"
                  isFilled={isFieldFilled(data?.address)}
                />

                <FormInputControl form={form} name="city" placeholder="City" isFilled={isFieldFilled(data?.city)} />
                <FormInputControl
                  form={form}
                  name="country"
                  placeholder="Country"
                  isFilled={isFieldFilled(data?.country)}
                />
                <FormInputControl
                  form={form}
                  name="postalCode"
                  placeholder="Postal code"
                  isFilled={isFieldFilled(data?.postalCode)}
                />
                <FormInputControl
                  form={form}
                  name="website"
                  placeholder="Website"
                  isFilled={isFieldFilled(data?.website)}
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Tax Details</h4>
                <CardDescription>Please attached your tax exemption certificate</CardDescription>
                <hr />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInputControl form={form} name="taxID" placeholder="Tax ID" isFilled={isFieldFilled(data?.taxID)} />

                <FileUpload
                  placeholder="Tax exemption certificate"
                  name="taxExemptionCertificate"
                  data={data?.Files?.find((file) => file.type === "TAX_EXEMPTION_CERTIFICATE")?.id as string}
                  onFileUpload={(url) => form.setValue("taxExemptionCertificate", url)}
                  error={
                    form?.formState?.errors?.taxExemptionCertificate
                      ? (form.formState.errors?.taxExemptionCertificate?.message as string)
                      : ""
                  }
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
                  isFilled={isFieldFilled(data?.bankDetails?.bankName)}
                />
                <FormInputControl
                  form={form}
                  name="bankDetails.accountHolder"
                  placeholder="Account holder"
                  isFilled={isFieldFilled(data?.bankDetails?.accountHolder)}
                />
                <FormInputControl
                  form={form}
                  name="bankDetails.iban"
                  placeholder="IBAN"
                  isFilled={isFieldFilled(data?.bankDetails?.iban)}
                />
                <FormInputControl
                  form={form}
                  name="bankDetails.bic"
                  placeholder="SWIFT"
                  isFilled={isFieldFilled(data?.bankDetails?.bic)}
                />
              </div>
              <h4 className="text-lg font-semibold">
                User Person
                <hr />
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInputControl
                  form={form}
                  name="user.name"
                  placeholder="User person name"
                  isFilled={isFieldFilled(data?.user?.name)}
                />
                <FormInputControl
                  form={form}
                  disabled={data?.email ? true : false}
                  name="user.email"
                  placeholder="User person email"
                  isFilled={isFieldFilled(data?.user?.email)}
                />
                <FormInputControl
                  form={form}
                  name="user.phone"
                  placeholder="User person phone"
                  isFilled={isFieldFilled(data?.user?.phone)}
                />
                <FormInputControl
                  form={form}
                  name="user.address"
                  placeholder="User person address"
                  isFilled={isFieldFilled(data?.user?.address)}
                />
              </div>

              <div>
                <h4 className="text-lg font-semibold">Article of Association & Logo</h4>
                <CardDescription>Please attached articles of association and logo</CardDescription>
                <hr />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm pl-2">Article of Association</label>

                  <FileUpload
                    placeholder="Article of Association"
                    name="articlesOfAssociation"
                    data={data?.Files?.find((file) => file.type == "ARTICLES_OF_ASSOCIATION")?.id}
                    error={
                      form?.formState?.errors?.articlesOfAssociation
                        ? (form.formState.errors?.articlesOfAssociation?.message as string)
                        : ""
                    }
                    onFileUpload={(url) => form.setValue("articlesOfAssociation", url)}
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm  pl-2"> Logo</label>
                  <FileUpload
                    placeholder="Logo of your Organization"
                    name="logo"
                    data={data?.Files?.find((file) => file.type == "LOGO")?.id}
                    error={form?.formState?.errors?.logo ? (form.formState.errors?.logo?.message as string) : ""}
                    onFileUpload={(url) => form.setValue("logo", url)}
                  />
                </div>
              </div>

              {isUpdate ? (
                <Alert
                  title={"Are you absolutely sure?"}
                  description={
                    "You are about to update your organization information, you would not be able to update it again."
                  }
                  form={form}
                  formId="organization-form"
                />
              ) : (
                <ButtonControl className="w-24" type="submit" disabled={form.formState.isSubmitting} />
              )}
            </form>
          </Form>
        </fieldset>
      </CardContent>
    </Card>
  );
}
