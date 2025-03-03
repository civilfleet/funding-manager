"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  FileText,
  Calendar,
  Banknote,
  User,
  Building,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";

import FormInputControl from "./helper/form-input-control";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

import DetailItem from "./helper/detail-item";
import LongText from "./helper/long-text";
import SectionBlock from "./helper/section-block";
import formatCurrency from "./helper/format-currency";
import ButtonControl from "./helper/button-control";
import { FileTypes, FundingRequest, FundingStatus } from "./../types";
import { StatusBadge } from "./helper/status-badge";

import FundingRequestPostData from "./forms/funding-request-post-data";

const amountOfferSchema = z.object({
  amountAgreed: z.coerce.number(),
});

export default function FundingRequestDetail({
  data,
  showAgreeAmountForm = true,
}: {
  data: FundingRequest;
  showAgreeAmountForm?: boolean;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();

  const showStatementForm =
    session?.user?.organizationId &&
    data.status === "FundsTransferred" &&
    data.files.filter((file) => file.type === "STATEMENT").length === 0;
  const showReportForm =
    session?.user?.organizationId &&
    data.status === "FundsTransferred" &&
    data.files.filter((file) => file.type === "REPORT").length === 0;
  const showReceiptForm =
    session?.user?.organizationId &&
    data.status === "FundsTransferred" &&
    data.files.filter((file) => file.type === "DONATION_RECEIPT").length === 0;

  const form = useForm<z.infer<typeof amountOfferSchema>>({
    resolver: zodResolver(amountOfferSchema),
    defaultValues: {
      amountAgreed: data.amountAgreed || 0,
    },
  });
  async function rejectRequest() {
    try {
      const response = await fetch(`/api/funding-request/${data.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Rejected" as FundingStatus }),
      });
      await response.json();
      data.status = "Rejected" as FundingStatus;

      toast({
        title: "Success",
        description: "Request Rejected Successfully. ",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: JSON.stringify(e),
      });
    }
  }

  async function onSubmit(values: z.infer<typeof amountOfferSchema>) {
    try {
      const response = await fetch(`/api/funding-request/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, status: "UnderReview" }),
      });
      await response.json();
      data.amountAgreed = values.amountAgreed;
      data.status = "UnderReview" as FundingStatus;
      toast({
        title: "Success",
        description: "Request Submitted Successfully. ",
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funding Request</h1>
          <p className="text-muted-foreground mt-2">
            Created on {format(new Date(data.createdAt), "PPP")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={data.status} />
          {!["FundsTransferred", "Rejected"].includes(data.status) && (
            <ButtonControl
              disabled={false}
              className=""
              type="button"
              variant={"destructive"}
              loading={false}
              onClick={rejectRequest}
              label="Reject Request"
            />
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {data.description}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Requested Amount
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(data.amountRequested)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agreed Amount</p>
                <p className="text-xl font-semibold">
                  {data.amountAgreed
                    ? formatCurrency(data.amountAgreed)
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionBlock title="Funding Purpose">
                <LongText content={data.purpose} />
              </SectionBlock>

              <SectionBlock title="Refinancing Concept">
                <LongText content={data.refinancingConcept} />
              </SectionBlock>

              <SectionBlock title="Sustainability Plan">
                <LongText content={data.sustainability} />
              </SectionBlock>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DetailItem label="Name" value={data.organization.name} />
                <DetailItem label="Tax ID" value={data.organization.taxID} />
                <DetailItem
                  label="Address"
                  value={`${data.organization.address}, ${data.organization.postalCode} ${data.organization.city}, ${data.organization.country}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Submitted By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DetailItem label="Name" value={data?.submittedBy?.name} />
                <DetailItem label="Email" value={data?.submittedBy?.email} />
                <DetailItem label="Phone" value={data?.submittedBy?.phone} />
              </CardContent>
            </Card>
          </div>

          {session?.user?.teamId &&
            showAgreeAmountForm &&
            !["FundsTransferred", "Rejected"].includes(data.status) && (
              <div className="flex flex-col items-end gap-2">
                <h3 className="text-lg font-semibold">Offer Amount</h3>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <div className="flex items-center  align-middle ">
                      <FormInputControl
                        name="amountAgreed"
                        placeholder="Amount to Offer"
                        type="number"
                        form={form}
                      />
                      <Button
                        type="submit"
                        className="btn btn-primary align-bottom ml-2"
                        disabled={form.formState.isSubmitting}
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              // add button for uploading the donation agreement.
            )}

          {showReceiptForm && (
            <FundingRequestPostData
              title="Upload Receipt"
              description="Upload the receipt after the funds have been transferred in 7 days."
              type={"DONATION_RECEIPT" as FileTypes}
              fundingRequestId={data.id}
            />
          )}

          {showReportForm && (
            <FundingRequestPostData
              title="Upload Report"
              description="Upload the funding request report after the 8 weeks period."
              type={"REPORT" as FileTypes}
              fundingRequestId={data.id}
            />
          )}

          {showStatementForm && (
            <FundingRequestPostData
              title="Upload Budget statement"
              description="Upload the budget statement after the 8 weeks period."
              type={"STATEMENT" as FileTypes}
              fundingRequestId={data.id}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailItem
                label="Expected Completion"
                value={format(new Date(data.expectedCompletionDate), "PPP")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.files.length > 0 ? (
                [...(data.files || []), ...(data.organization.Files || [])].map(
                  (file, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={
                          `${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${file?.id}` as string
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {(file?.name as string) || file.type}
                      </a>
                    </Button>
                  )
                )
              ) : (
                <p className="text-muted-foreground text-sm">
                  No documents attached
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
