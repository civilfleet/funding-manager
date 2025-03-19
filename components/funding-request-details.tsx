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

import { useToast } from "@/hooks/use-toast";

import { useSession } from "next-auth/react";

import DetailItem from "./helper/detail-item";
import LongText from "./helper/long-text";
import SectionBlock from "./helper/section-block";
import formatCurrency from "./helper/format-currency";
import ButtonControl from "./helper/button-control";
import { FundingRequest, FundingStatus, Roles } from "./../types";
import { StatusBadge } from "./helper/status-badge";

import { FileList } from "./helper/file-list";
import FundingRequestDetailsForm from "./forms/funding-request-detail-form";

import { useTeamStore } from "@/store/store";

export default function FundingRequestDetail({
  data,
}: {
  data: FundingRequest;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { teamId } = useTeamStore();
  const isTeam =
    session?.user?.roles?.includes(Roles.Team) ||
    session?.user?.roles?.includes(Roles.Admin);
  const showRejectButton =
    isTeam && !["FundsTransferred", "Rejected"].includes(data.status);

  async function rejectRequest() {
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
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funding Request</h1>
          <p className="text-muted-foreground mt-2">
            Created on {format(new Date(data.createdAt), "PPP")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={data.status} />
          {showRejectButton && (
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
          <FundingRequestDetailsForm data={data} isTeam={isTeam} />
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
          <FileList
            files={data.files}
            organizationFiles={
              data.organization.Files ? data.organization.Files : []
            }
          />
        </div>
      </div>
    </div>
  );
}
