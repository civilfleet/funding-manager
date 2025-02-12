"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  FileText,
  Calendar,
  Banknote,
  User,
  Building,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { FundingRequest } from "@/types";
import FormInputControl from "./helper/FormInputControl";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useSession } from "next-auth/react";

const amountOfferSchema = z.object({
  amountAgreed: z.coerce.number(),
});

export default function FundingRequestDetail({
  data,
}: {
  data: FundingRequest;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof amountOfferSchema>>({
    resolver: zodResolver(amountOfferSchema),
    defaultValues: {
      amountAgreed: data.amountAgreed,
    },
  });

  async function onSubmit(values: z.infer<typeof amountOfferSchema>) {
    try {
      console.log("values", values);

      const response = await fetch(`/api/funding-request/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, status: "UnderReview" }),
      });
      await response.json();
      data.amountAgreed = values.amountAgreed;
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
          <Badge>{data?.status}</Badge>
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

          {session?.user?.provider === "keycloak" && (
            <div className="flex flex-col items-end gap-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <FormInputControl
                      name="amountAgreed"
                      placeholder="Amount to Offer"
                      type="number"
                      form={form}
                    />
                    <Button
                      type="submit"
                      className="btn btn-primary"
                      disabled={form.formState.isSubmitting}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
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
              {/* {data.files.length > 0 ? (
                data.files.map((file, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file?.name}
                    </a>
                  </Button>
                ))
              ) : ( */}
              <p className="text-muted-foreground text-sm">
                No documents attached
              </p>
              {/* )} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function LongText({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
