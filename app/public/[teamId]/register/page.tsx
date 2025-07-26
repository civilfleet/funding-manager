"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "@/components/helper/form-input-control";
import { createOrganizationSchema } from "@/validations/organizations";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ButtonControl from "@/components/helper/button-control";
import FileUpload from "@/components/file-uploader";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'


export default function RegisterPage() {
  const router = useRouter()

  const { toast } = useToast();
  const params = useParams();
  const [teamName, setTeamName] = useState<string>("");
  const [strategicPriorities, setStrategicPriorities] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const response = await fetch(`/api/public/teams/${params.teamId}`);
        if (!response.ok) {
          router.replace('/')
          throw new Error("Team not found");
        }
        const data = await response.json();
        setTeamName(data.name);
        setStrategicPriorities(data.strategicPriorities || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Team not found",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, [params.teamId, toast, router]);

  const form = useForm<z.infer<typeof createOrganizationSchema>>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      taxExemptionCertificate: "",
      articlesOfAssociation: "",
      taxID: "",
      logo: "",
      bankDetails: {
        bankName: "",
        accountHolder: "",
        iban: "",
        bic: "",
      },
      user: {
        name: "",
        email: "",
        phone: "",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof createOrganizationSchema>) {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          isFilledByOrg: true,
          teamId: params.teamId,
        }),
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
        description: "Your organization registration request has been submitted. We will review it and get back to you soon.",
        variant: "default",
      });

      // Reset form
      form.reset();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-10">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Register Your Organization with {teamName}</CardTitle>
          <CardDescription>
            Please fill out the form below to request an organization account with {teamName}. We will review your application and get back to you soon.
          </CardDescription>
          {strategicPriorities && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                About {teamName}
              </h3>
              <div className="text-sm whitespace-pre-wrap text-foreground">
                {strategicPriorities}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <fieldset disabled={form.formState.isSubmitting}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                id="organization-registration-form"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormInputControl
                    form={form}
                    name="name"
                    placeholder="Organization name"
                  />
                  <FormInputControl
                    form={form}
                    name="email"
                    placeholder="Email address *"
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
                  <FormInputControl
                    form={form}
                    name="city"
                    placeholder="City"
                  />
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
                    Please attach your tax exemption certificate and articles of association
                  </CardDescription>
                  <hr className="my-4" />
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
                    label="Tax exemption certificate"
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
                  <h4 className="text-lg font-semibold">Contact Person Details</h4>
                  <hr className="my-4" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInputControl
                    form={form}
                    name="user.name"
                    placeholder="Contact person name"
                  />
                  <FormInputControl
                    form={form}
                    name="user.email"
                    placeholder="Contact person email (used for login) *"
                  />
                  <FormInputControl
                    form={form}
                    name="user.phone"
                    placeholder="Contact person phone"
                  />
                </div>


                <div>
                  <h4 className="text-lg font-semibold">Article of Association & Logo
                  </h4>
                  <hr className="my-4" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FileUpload
                    placeholder="Articles of association"
                    name="articlesOfAssociation"
                    label="Articles of association"
                    onFileUpload={(url) =>
                      form.setValue("articlesOfAssociation", url)
                    }
                    error={
                      form?.formState?.errors?.articlesOfAssociation
                        ? (form.formState.errors?.articlesOfAssociation
                          ?.message as string)
                        : ""
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <ButtonControl
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    label="Submit Registration Request"
                  />
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Already have an account? Login
                  </Link>
                </div>
              </form>
            </Form>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
} 