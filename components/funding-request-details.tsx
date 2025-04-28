"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Icons
import { FileText, Calendar, Banknote, User, Building, ClipboardList, FileIcon, ChevronRight } from "lucide-react";

// Custom Components
import DetailItem from "./helper/detail-item";
import LongText from "./helper/long-text";
import SectionBlock from "./helper/section-block";
import formatCurrency from "./helper/format-currency";
import { FileList } from "./helper/file-list";

// Types
import { type FundingRequest, type FundingStatus, Roles } from "./../types";
import FundingRequestHeader from "./funding-request-header";
import TransactionTable from "@/components/table/transaction-table";

export default function FundingRequestDetail({
  data,
  teamId,
  organizationId,
}: {
  data: FundingRequest;
  teamId?: string;
  organizationId?: string;
}) {
  const { data: session } = useSession();

  const [currentData, setCurrentData] = useState<FundingRequest>(data);
  const [currentStatus, setCurrentStatus] = useState<FundingStatus>(data?.status);

  const isTeam = session?.user?.roles?.includes(Roles.Team) || session?.user?.roles?.includes(Roles.Admin);

  const handleUpdate = (updatedData: FundingRequest) => {
    setCurrentData(updatedData);
    setCurrentStatus(updatedData.status);
  };

  if (!currentData) return null;

  const calculateMonthsDuration = () => {
    return Math.ceil(
      (new Date(currentData.expectedCompletionDate).getTime() - new Date(currentData.createdAt).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Status Header */}
      <FundingRequestHeader
        data={currentData}
        teamId={teamId}
        organizationId={organizationId}
        isTeam={isTeam}
        onUpdate={handleUpdate}
      />

      {/* Tab Navigation */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Request Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
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
                <CardContent className="pt-6 text-muted-foreground leading-relaxed">
                  {currentData.description}
                </CardContent>
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
                        <p className="text-2xl font-bold text-primary">{formatCurrency(currentData.amountRequested)}</p>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">Agreed Amount</p>
                        <p className="text-2xl font-bold">
                          {currentData.amountAgreed ? formatCurrency(currentData.amountAgreed) : "Pending"}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">Remaining Amount</p>
                        <p className="text-2xl font-bold">
                          {currentData.remainingAmount ? formatCurrency(currentData.remainingAmount) : "Pending"}
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
                        {format(new Date(currentData.createdAt), "MMMM d, yyyy")}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Expected Completion</p>
                      <Badge variant="outline" className="font-normal">
                        {format(new Date(currentData.expectedCompletionDate), "MMMM d, yyyy")}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-base font-semibold">{calculateMonthsDuration()} months</p>
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
                    <LongText content={currentData.purpose} />
                  </SectionBlock>
                  <Separator />
                  <SectionBlock title="Refinancing Concept">
                    <LongText content={currentData.refinancingConcept} />
                  </SectionBlock>
                  <Separator />
                  <SectionBlock title="Sustainability Plan">
                    <LongText content={currentData.sustainability} />
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
                      <p className="font-semibold text-lg">{currentData.organization.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentData.organization.address}
                        <br />
                        {currentData.organization.postalCode} {currentData.organization.city}
                        <br />
                        {currentData.organization.country}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">Tax ID: </span>
                        {currentData.organization.taxID}
                      </p>
                    </div>

                    {/* Submitted By */}
                    <div className="p-4 bg-muted/20 rounded-md">
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Submitted By
                      </h3>
                      <p className="font-semibold">{currentData?.submittedBy?.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentData?.submittedBy?.email}
                        <br />
                        {currentData?.submittedBy?.phone}
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
                    {currentData.files.length} document
                    {currentData.files.length !== 1 ? "s" : ""} attached
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {currentData.files.slice(0, 3).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate max-w-[180px]">{file.name || file.type}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {currentData.files.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View All Documents
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>All documents related to this funding request</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList files={currentData.files} organizationFiles={currentData.organization.Files || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Complete information about {currentData.organization.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <DetailItem label="Organization Name" value={currentData.organization.name} />
                  <DetailItem label="Tax ID" value={currentData.organization.taxID} />
                  <DetailItem label="Registration Number" value={currentData.organization.taxID || "N/A"} />
                  <DetailItem label="Website" value={currentData.organization.website || "N/A"} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <DetailItem label="Street" value={currentData.organization.address} />
                  <DetailItem label="City" value={currentData.organization.city} />
                  <DetailItem label="Postal Code" value={currentData.organization.postalCode} />
                  <DetailItem label="Country" value={currentData.organization.country} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>All transactions related to this funding request</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable fundingRequestId={currentData.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
