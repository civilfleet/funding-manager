"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function FundingRequestDetail({
  data,
}: {
  data: FundingRequest;
}) {
  const statusVariant =
    {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      UnderReview: "bg-blue-100 text-blue-800",
    }[data.status] || "bg-gray-100 text-gray-800";

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
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Agreed Amount:
            </span>
            <span className="text-lg font-semibold">
              {data.amountAgreed ? formatCurrency(data.amountAgreed) : "N/A"}
            </span>
          </div>

          <Select
            value={data.status}
            // onValueChange={(value) => handleStatusChange(value)}
          >
            <SelectTrigger className={`w-[180px] ${statusVariant}`}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending" className="hover:bg-yellow-50">
                Pending
              </SelectItem>
              <SelectItem value="Approved" className="hover:bg-green-50">
                Approved
              </SelectItem>
              <SelectItem value="Rejected" className="hover:bg-red-50">
                Rejected
              </SelectItem>
              <SelectItem value="Under Review" className="hover:bg-blue-50">
                Under Review
              </SelectItem>
            </SelectContent>
          </Select>
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
