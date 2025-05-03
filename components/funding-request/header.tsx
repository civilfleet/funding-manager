"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

import { StatusBadge } from "@/components/helper/status-badge";
import FundingRequestDetailsForm from "@/components/forms/funding-request-detail-form";
import formatCurrency from "@/components/helper/format-currency";

import { type FundingRequest, type FundingStatus } from "@/types";
import CreateTransaction from "@/components/forms/modal/create-transaction";

interface FundingRequestHeaderProps {
  data: FundingRequest;
  teamId?: string;
  organizationId?: string;
  isTeam?: boolean;
  refreshData: () => void;
}

export default function FundingRequestHeader({ data, isTeam, refreshData }: FundingRequestHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRejecting, setIsRejecting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<FundingStatus>(data?.status);

  const teamId = data?.organization?.teamId;
  const organizationId = data?.organization?.id;
  const showRejectButton = isTeam && !["FundsTransferred", "Rejected", "Approved"].includes(currentStatus);

  const statusColors = {
    Pending: "bg-amber-50 border-amber-200",
    Approved: "bg-green-50 border-green-200",
    Rejected: "bg-red-50 border-red-200",
    FundsTransferred: "bg-blue-50 border-blue-200",
    UnderReview: "bg-purple-50 border-purple-200",
    Processing: "bg-yellow-50 border-yellow-200",
    default: "bg-gray-50 border-gray-200",
  };

  const getStatusColor = () => statusColors[currentStatus] || statusColors.default;

  async function rejectRequest() {
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/funding-requests/${data.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Rejected" as FundingStatus,
          teamId,
        }),
      });

      if (!response.ok) throw new Error("Failed to reject request");

      const { data: updatedData } = await response.json();
      setCurrentStatus(updatedData.status);
      refreshData();

      toast({
        title: "Request Rejected",
        description: "The funding request has been successfully rejected.",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "An error occurred while rejecting the request",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className={`shadow-lg ${getStatusColor()} rounded-xl p-8 mb-8 bg-white dark:bg-gray-900`}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Funding Request</h1>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Submitted on {format(new Date(data.createdAt), "MMMM d, yyyy")}
            </p>
          </div>

          {currentStatus !== "Pending" && currentStatus !== "Rejected" && (
            <div className="w-full lg:w-auto p-4 bg-muted/10 rounded-lg border border-muted/20">
              <p className="text-sm font-medium text-muted-foreground">Agreed Amount</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {data.amountAgreed ? formatCurrency(data.amountAgreed) : "Not Set"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {currentStatus === "Pending" && (
            <div className="w-full lg:w-1/2">
              <FundingRequestDetailsForm data={data} isTeam={isTeam} refreshData={refreshData} />
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            {showRejectButton && (
              <Button variant="destructive" onClick={rejectRequest} disabled={isRejecting} className="w-full sm:w-auto">
                {isRejecting ? (
                  <>
                    <span className="mr-2">Processing</span>
                    <Clock className="h-4 w-4 animate-spin" />
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
              <Button variant="default" className="w-full sm:w-auto">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Transfer Funds
              </Button>
            )}

            {currentStatus === "UnderReview" && !data?.donationAgreement?.[0]?.id && isTeam && (
              <Button
                variant="outline"
                onClick={() => router.push(`/teams/${teamId}/donation-agreements/create?fundingRequestId=${data.id}`)}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Donation Agreement
              </Button>
            )}

            {(currentStatus === "Processing" || currentStatus === "FundsTransferred") && (
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => {
                  const isOrgPath = window.location.pathname.includes("/organizations/");
                  if (isOrgPath) {
                    router.push(
                      `/organizations/${organizationId}/donation-agreements/${data?.donationAgreement?.[0]?.id}`
                    );
                  } else {
                    router.push(`/teams/${teamId}/donation-agreements/${data?.donationAgreement?.[0]?.id}`);
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View Donation Agreement
              </Button>
            )}
            {currentStatus === "Approved" && isTeam && <CreateTransaction fundingRequest={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}
