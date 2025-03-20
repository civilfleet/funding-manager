"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Banknote,
  User,
  Building,
  ClipboardList,
  Clock,
  FileIcon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import DetailItem from "./helper/detail-item";
import LongText from "./helper/long-text";
import SectionBlock from "./helper/section-block";
import formatCurrency from "./helper/format-currency";
import { type FundingRequest, type FundingStatus, Roles } from "./../types";
import { StatusBadge } from "./helper/status-badge";
import { FileList } from "./helper/file-list";
import FundingRequestDetailsForm from "./forms/funding-request-detail-form";
import { useTeamStore } from "@/store/store";
import { useState } from "react";

export default function FundingRequestDetail({
  data,
}: {
  data: FundingRequest;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { teamId } = useTeamStore();
  const [isRejecting, setIsRejecting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<FundingStatus>(
    data.status
  );

  const isTeam =
    session?.user?.roles?.includes(Roles.Team) ||
    session?.user?.roles?.includes(Roles.Admin);

  const showRejectButton =
    isTeam && !["FundsTransferred", "Rejected"].includes(currentStatus);

  async function rejectRequest() {
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/funding-requests/${data.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Rejected" as FundingStatus,
          teamId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      await response.json();
      setCurrentStatus("Rejected" as FundingStatus);

      toast({
        title: "Request Rejected",
        description: "The funding request has been successfully rejected.",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description:
          e instanceof Error
            ? e.message
            : "An error occurred while rejecting the request",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  if (!data) return null;

  const getStatusColor = () => {
    switch (currentStatus) {
      case "Pending":
        return "bg-amber-50 border-amber-200";
      case "Approved":
        return "bg-green-50 border-green-200";
      case "Rejected":
        return "bg-red-50 border-red-200";
      case "FundsTransferred":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className={`p-6 rounded-lg border ${getStatusColor()} mb-8`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Funding Request
              </h1>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Submitted on {format(new Date(data.createdAt), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {showRejectButton && (
              <Button
                variant="destructive"
                onClick={rejectRequest}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <>
                    <span className="mr-2">Processing</span>
                    <span className="animate-spin">
                      <Clock className="h-4 w-4" />
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
            )}

            {currentStatus === "Approved" && (
              <Button variant="default">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Transfer Funds
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Request Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-muted-foreground leading-relaxed">
                  {data.description}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-sm font-medium text-muted-foreground">
                          Requested Amount
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(data.amountRequested)}
                        </p>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">
                          Agreed Amount
                        </p>
                        <p className="text-2xl font-bold">
                          {data.amountAgreed
                            ? formatCurrency(data.amountAgreed)
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Submission Date
                      </p>
                      <div className="text-base font-semibold flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {format(new Date(data.createdAt), "MMMM d, yyyy")}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Expected Completion
                      </p>
                      <div className="text-base font-semibold flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {format(
                            new Date(data.expectedCompletionDate),
                            "MMMM d, yyyy"
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-base font-semibold">
                        {Math.ceil(
                          (new Date(data.expectedCompletionDate).getTime() -
                            new Date(data.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24 * 30)
                        )}{" "}
                        months
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Details Section */}
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

              <FundingRequestDetailsForm data={data} isTeam={isTeam} />
            </div>

            {/* Right Column - Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-muted/30 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-md">
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Organization
                      </h3>
                      <p className="font-semibold text-lg">
                        {data.organization.name}
                      </p>
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
                    {data.files.slice(0, 3).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate max-w-[180px]">
                            {file.name || file.type}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {data.files.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        View All Documents
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                All documents related to this funding request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileList
                files={data.files}
                organizationFiles={
                  data.organization.Files ? data.organization.Files : []
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Complete information about {data.organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <DetailItem
                    label="Organization Name"
                    value={data.organization.name}
                  />
                  <DetailItem label="Tax ID" value={data.organization.taxID} />
                  <DetailItem
                    label="Registration Number"
                    value={data.organization.taxID || "N/A"}
                  />
                  <DetailItem
                    label="Website"
                    value={data.organization.website || "N/A"}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <DetailItem
                    label="Street"
                    value={data.organization.address}
                  />
                  <DetailItem label="City" value={data.organization.city} />
                  <DetailItem
                    label="Postal Code"
                    value={data.organization.postalCode}
                  />
                  <DetailItem
                    label="Country"
                    value={data.organization.country}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
