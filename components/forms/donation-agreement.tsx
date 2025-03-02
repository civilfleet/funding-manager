"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDonationAgreementSchema as schema } from "@/validations/donation-agreement";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import ButtonControl from "../helper/button-control";
import { useState, useEffect } from "react";
import FileUpload from "../file-uploader";
import { DataSelectBox } from "../helper/data-select-box";
import { FundingRequest } from "@/types";
import FundingRequestDetail from "../funding-request-details";
import { Badge } from "../ui/badge";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "../ui/textarea";

type DonationAgreement = {
  email: string;
  name: string;
};

export default function DonationAgreement() {
  const { toast } = useToast();
  const [fundingRequestDetail, setFundingRequestDetail] =
    useState<FundingRequest>();
  const [contactPersons, setContactPersons] = useState<string[]>([]);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fundingRequestId: "",
    },
  });

  // Watch changes to fundingRequestId
  const fundingRequestId = useWatch({
    control: form.control,
    name: "fundingRequestId",
  });

  const contactPerson = useWatch({
    control: form.control,
    name: "contactPerson",
  });

  useEffect(() => {
    if (contactPerson) {
      if (!contactPersons.includes(contactPerson)) {
        setContactPersons([...contactPersons, contactPerson]);
      }
    }
  }, [contactPerson, contactPersons]);

  // Fetch funding request details when fundingRequestId changes
  useEffect(() => {
    if (!fundingRequestId) return;

    const fetchFundingRequestDetail = async () => {
      try {
        const response = await fetch(
          `/api/funding-request/${fundingRequestId}`
        );
        const { data } = await response.json();
        setFundingRequestDetail(data);
      } catch (error) {
        console.error("Error fetching funding request detail:", error);
      }
    };

    fetchFundingRequestDetail();
  }, [fundingRequestId]);

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const response = await fetch("/api/donation-agreement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          contactPersons: [...contactPersons],
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update donation agreement");
      }

      toast({
        title: "Success",
        description: "Donation Agreement information updated",
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
        <CardTitle>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Donation Agreement
              </h1>
            </div>
          </div>
        </CardTitle>
        <CardDescription>Please upload information below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            id="organization-form"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Controller to handle Select Box */}

              <Controller
                control={form.control}
                name="fundingRequestId"
                render={({ field }) => (
                  <DataSelectBox
                    targetKey="id"
                    url="/api/funding-request"
                    attribute="name"
                    label="Select Funding Request"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <DataSelectBox
                    targetKey="email"
                    url="/api/contact-person"
                    attribute="email"
                    label="Select Contact person"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />

              <Label className="text-sm text-gray-500">
                Donation Agreement Details *
              </Label>
              <Textarea
                {...form.register("agreement")}
                name="agreement"
                placeholder="Agreement details..."
              />

              <Label className="text-sm text-gray-500">
                Upload Donation Agreement
              </Label>
              <FileUpload
                placeholder="Donation Agreement"
                name="file"
                data={""}
                onFileUpload={(url) => form.setValue("file", url)}
              />
            </div>
            {contactPersons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Contact Persons</h3>
                {contactPersons.map((person, index) => (
                  <Badge key={index} className="m-1 p-1">
                    {person}
                  </Badge>
                ))}
              </div>
            )}
            <ButtonControl
              className="w-24"
              type="submit"
              disabled={form.formState.isSubmitting}
            />
          </form>
        </Form>
        {/* Show funding request details if available */}
        <div className="mt-8">
          {fundingRequestDetail && (
            <FundingRequestDetail
              data={fundingRequestDetail}
              showAgreeAmountForm={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
