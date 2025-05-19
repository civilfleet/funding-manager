"use client";

import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Icons
import { FileText, Calendar, Banknote, User, Building, ClipboardList, FileIcon, ChevronRight } from "lucide-react";

// Custom Components
import LongText from "@/components/helper/long-text";
import SectionBlock from "@/components/helper/section-block";
import formatCurrency from "@/components/helper/format-currency";

// Types
import { type FundingRequest } from "@/types";
import Link from "next/link";
import { calculateMonthsDuration } from "@/lib/utils";

const FundingRequestOverview = ({ data }: { data: FundingRequest }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Project Overview */}
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-muted-foreground leading-relaxed">{data.description}</CardContent>
        </Card>

        {/* Financial & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Banknote className="h-5 w-5 text-primary" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Requested Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(data.amountRequested)}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Agreed Amount</p>
                  <p className="text-2xl font-bold">
                    {data.amountAgreed ? formatCurrency(data.amountAgreed) : "Submitted"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Remaining Amount</p>
                  <p className="text-2xl font-bold">
                    {data.remainingAmount ? formatCurrency(data.remainingAmount) : "Submitted"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                <Badge variant="outline" className="font-normal">
                  {format(new Date(data.createdAt), "MMMM d, yyyy")}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Expected Completion</p>
                <Badge variant="outline" className="font-normal">
                  {format(new Date(data.expectedCompletionDate), "MMMM d, yyyy")}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-base font-semibold">
                  {calculateMonthsDuration(data.expectedCompletionDate, data.createdAt)} months
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <SectionBlock title="Funding Purpose">
              <LongText content={data.purpose} />
            </SectionBlock>
            <Separator />
            <SectionBlock title="Refinancing Concept">
              <LongText content={data.refinancingConcept} />
            </SectionBlock>
            <Separator />
            <SectionBlock title="Sustainability Plan">
              <LongText content={data.sustainability} />
            </SectionBlock>
          </CardContent>
        </Card>
      </div>
      {/* Right Column */}
      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Organization */}
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Organization
                </h3>
                <p className="font-semibold text-lg">{data.organization.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.organization.address}
                  <br />
                  {data.organization.postalCode} {data.organization.city}
                  <br />
                  {data.organization.country}
                </p>
                <p className="text-sm mt-2">
                  <span className="text-muted-foreground">Tax ID: </span>
                  {data.organization.taxID}
                </p>
              </div>

              {/* Submitted By */}
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Submitted By
                </h3>
                <p className="font-semibold">{data?.submittedBy?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data?.submittedBy?.email}
                  <br />
                  {data?.submittedBy?.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileIcon className="h-5 w-5 text-primary" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              {data.files.length} document
              {data.files.length !== 1 ? "s" : ""} attached
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {data.files.slice(0, 3).map((file: { id: string; name: string; type: string }, index: number) => (
                <Link
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/files/${file.id}`}
                  key={index}
                  >
                  <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate max-w-[180px]">{file.name || file.type}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}

              {data.files.length > 3 && (
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Documents
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FundingRequestOverview;
