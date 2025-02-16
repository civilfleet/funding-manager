"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/FormInputControl";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/validations/organizations";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import ButtonControl from "../helper/ButtonControl";
import Alert from "@/components/alert";
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
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  contactPerson?: {
    name?: string;
    email: string;
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
  const [isUpdate] = useState(data?.email ? true : false);
  const [isFilledByOrg, setFillByOrg] = useState(data?.isFilledByOrg);
  const schema = isUpdate ? updateOrganizationSchema : createOrganizationSchema;

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
      taxExemptionCertificate: data?.taxExemptionCertificate || "",
      articlesOfAssociation: data?.articlesOfAssociation || "",
      taxID: data?.taxID || "",
      logo: data?.logo || "",
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

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      let response;
      if (!data?.email) {
        response = await fetch("/api/organization", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            teamId: team.id,
            isFilledByOrg: false,
          }),
        });
      } else {
        response = await fetch("/api/organization", {
          method: "PUT",
          body: JSON.stringify({ ...values, isFilledByOrg: true }),
        });
        setFillByOrg(true);
      }
      // check for error
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
        description: isUpdate
          ? "Organization information updated"
          : "Organization information created",
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
        <CardDescription>
          Please update your organization information below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset disabled={form.formState.isSubmitting || isFilledByOrg}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              id="organization-form"
            >
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
              <div>
                <h4 className="text-lg font-semibold">Tax Details</h4>
                <CardDescription>
                  Please attached your tax exemption certificate
                </CardDescription>
                <hr />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInputControl
                  form={form}
                  name="taxID"
                  placeholder="Tax ID"
                />

                <FileUpload
                  placeholder="Tax exemption certificate"
                  name="taxExemptionCertificate"
                  data={data?.taxExemptionCertificate}
                  onFileUpload={(url) =>
                    form.setValue("taxExemptionCertificate", url)
                  }
                  error={
                    form?.formState?.errors?.taxExemptionCertificate
                      ? (form.formState.errors?.taxExemptionCertificate
                          ?.message as string)
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
                  disabled={data?.email ? true : false}
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

              <div>
                <h4 className="text-lg font-semibold">
                  Article of Association & Logo
                </h4>
                <CardDescription>
                  Please attached articles of association and logo
                </CardDescription>
                <hr />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm pl-2">
                    Article of Association
                  </label>

                  <FileUpload
                    placeholder="Article of Association"
                    name="articlesOfAssociation"
                    data={data?.taxExemptionCertificate}
                    error={
                      form?.formState?.errors?.articlesOfAssociation
                        ? (form.formState.errors?.articlesOfAssociation
                            ?.message as string)
                        : ""
                    }
                    onFileUpload={(url) =>
                      form.setValue("articlesOfAssociation", url)
                    }
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm  pl-2"> Logo</label>
                  <FileUpload
                    placeholder="Logo of your Organization"
                    name="logo"
                    data={data?.logo}
                    error={
                      form?.formState?.errors?.logo
                        ? (form.formState.errors?.logo?.message as string)
                        : ""
                    }
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
                <ButtonControl
                  className="w-24"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                />
              )}
            </form>
          </Form>
        </fieldset>
      </CardContent>
    </Card>
  );
}
