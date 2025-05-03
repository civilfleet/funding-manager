"use client";

import type React from "react";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import Link from "next/link";
import { CheckCircle, CreditCard, Download, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { Roles } from "@/types";

import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updateDonationAgreementSchema as schema } from "@/validations/donation-agreement";
import { FundingStatus, type DonationAgreement } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FileUpload from "@/components/file-uploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DetailItem from "../helper/detail-item";

export default function SignDonationAgreement({
  data: initialData,
  teamId,
}: {
  data: DonationAgreement;
  teamId?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes(Roles.Admin);

  const [data, setData] = useState<DonationAgreement>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const approved = data.fundingRequest?.status === "Approved";
  const signaturesCompleted = data.userSignatures.every((signature) => signature?.signedAt);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      file: "",
    },
  });

  const refreshData = async () => {
    try {
      const response = await fetch(`/api/donation-agreements/${data.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch updated data");
      }
      const { data: updatedData } = await response.json();
      setData(updatedData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/donation-agreements/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          id: data.id,
          userId: isAdmin ? selectedUserId : session?.user.userId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update donation agreement");
      }

      await refreshData();

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
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeFundingRequestStatus() {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/funding-requests/${data.fundingRequestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: FundingStatus.Approved,
          donationId: data.id,
          teamId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update funding request status");
      }

      await refreshData();

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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl ">
      <CardHeader>
        <CardTitle className="text-3xl">Sign Donation Agreement</CardTitle>
        <CardDescription>Review and sign the donation agreement</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="organization-form">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Funding Request Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Funding Request Name" value={data.fundingRequest?.name} />
                  <DetailItem label="Purpose" value={data.fundingRequest?.purpose} />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Agreement Details</h2>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{data.agreement}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <DetailItem label="Created At" value={new Date(data.createdAt).toLocaleString()} />
                  <DetailItem label="Updated At" value={new Date(data.updatedAt).toLocaleString()} />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Created By</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Name" value={data.createdBy?.name} />
                  <DetailItem label="Email" value={data.createdBy?.email} type="email" />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Agreement File</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Please download the agreement, sign it, and re-upload it.
                </p>
                {data.file?.url && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${data.file?.id}`}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Agreement
                    </Link>
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">User Signatures</h2>
                {data.userSignatures.length > 0 ? (
                  <div className="space-y-2">
                    {data.userSignatures.map((signature, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium">{signature.user?.email}</span>
                        {signature.signedAt && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">{new Date(signature.signedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No signatures yet.</p>
                )}
              </div>

              <Separator />
              {!signaturesCompleted && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Upload Signed Agreement</h2>
                  {isAdmin && (
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">Sign on behalf of:</label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user to sign for" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.userSignatures.map((signature, index) => (
                            <SelectItem
                              key={index}
                              value={signature.user?.id || ""}
                              disabled={signature.signedAt !== null}
                            >
                              {signature.user?.email}
                              {signature.signedAt && " (Already signed)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
          <Button type="submit" form="organization-form" disabled={isSubmitting || (isAdmin && !selectedUserId)}>
            <Upload className="mr-2 h-4 w-4" />
            {isAdmin ? "Submit Signed Agreement on Behalf of User" : "Submit Signed Agreement"}
          </Button>
        )}

        {signaturesCompleted && teamId && (
          <Button type="button" className="m-2" disabled={approved} onClick={changeFundingRequestStatus}>
            <CreditCard className="mr-2 h-5 w-5" />
            {!approved ? "Approve Funding Request" : "Funding Request Approved"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
