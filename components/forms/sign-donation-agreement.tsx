"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import { CheckCircle, CreditCard, Download, Upload } from "lucide-react";

import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updateDonationAgreementSchema as schema } from "@/validations/donation-agreement";
import type { DonationAgreement } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FileUpload from "@/components/file-uploader";

import { useTeamStore } from "@/store/store";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
}

function DetailItem({
  label,
  value,
  type = "text",
}: {
  label: string;
  value?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {type === "email" ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-sm">{value || "N/A"}</span>
      )}
    </div>
  );
}

export default function SignDonationAgreement({
  data,
}: {
  data: DonationAgreement;
}) {
  const { toast } = useToast();
  const { teamId } = useTeamStore();

  const fundsTransferred = data.fundingRequest?.status === "FundsTransferred";

  const signaturesCompleted = data.userSignatures.every(
    (signature) => signature?.signedAt
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      file: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const response = await fetch(`/api/donation-agreements/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          id: data.id,
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
  async function changeFundingRequestStatus() {
    try {
      const response = await fetch(
        `/api/funding-requests/${data.fundingRequestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "FundsTransferred",
            donationId: data.id,
            teamId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update funding request status");
      }

      toast({
        title: "Success",
        description: "Funding Request status updated",
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
    <Card className="w-full max-w-3xl ">
      <CardHeader>
        <CardTitle className="text-3xl">Sign Donation Agreement</CardTitle>
        <CardDescription>
          Review and sign the donation agreement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            id="organization-form"
          >
            <div className="space-y-6">
              <div>
                <SectionTitle>Funding Request Details</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Funding Request Name"
                    value={data.fundingRequest?.name}
                  />
                  <DetailItem
                    label="Purpose"
                    value={data.fundingRequest?.purpose}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <SectionTitle>Agreement Details</SectionTitle>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {data.agreement}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <DetailItem
                    label="Created At"
                    value={new Date(data.createdAt).toLocaleString()}
                  />
                  <DetailItem
                    label="Updated At"
                    value={new Date(data.updatedAt).toLocaleString()}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <SectionTitle>Created By</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Name" value={data.createdBy?.name} />
                  <DetailItem
                    label="Email"
                    value={data.createdBy?.email}
                    type="email"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <SectionTitle>Agreement File</SectionTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  Please download the agreement, sign it, and re-upload it.
                </p>
                {data.file?.url && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${data.file?.id}`}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Agreement
                    </Link>
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <SectionTitle>User Signatures</SectionTitle>
                {data.userSignatures.length > 0 ? (
                  <div className="space-y-2">
                    {data.userSignatures.map((signature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <span className="text-sm font-medium">
                          {signature.user?.email}
                        </span>
                        {signature.signedAt && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">
                              {new Date(signature.signedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No signatures yet.
                  </p>
                )}
              </div>

              <Separator />
              {!signaturesCompleted && (
                <div>
                  <SectionTitle>Upload Signed Agreement</SectionTitle>
                  <FileUpload
                    placeholder="Drag and drop or click to upload"
                    name="file"
                    data={""}
                    onFileUpload={(url) => form.setValue("file", url)}
                  />
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        {!signaturesCompleted && (
          <Button
            type="submit"
            form="organization-form"
            disabled={form.formState.isSubmitting}
          >
            <Upload className="mr-2 h-4 w-4" />
            Submit Signed Agreement
          </Button>
        )}

        {signaturesCompleted && teamId && (
          <Button
            type="button"
            className="m-2"
            disabled={fundsTransferred}
            onClick={changeFundingRequestStatus}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            {!fundsTransferred
              ? "Complete Funds Transfer"
              : "Funds Transferred"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
