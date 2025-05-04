import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FundingStatus } from "@/types";
import { Info } from "lucide-react";

interface StatusBadgeProps {
  status: FundingStatus;
}
export const statusColorMap = {
  [FundingStatus.Submitted]: "bg-amber-500", // Amber for Submitted - initial state
  [FundingStatus.Accepted]: "bg-blue-500", // Blue for Accepted - moving forward
  [FundingStatus.WaitingForSignature]: "bg-indigo-600", // Indigo for WaitingForSignature - formal step
  [FundingStatus.Approved]: "bg-emerald-500", // Emerald for Approved - positive milestone
  [FundingStatus.FundsDisbursing]: "bg-violet-500", // Violet for FundsDisbursing - active process
  [FundingStatus.Completed]: "bg-green-600", // Darker Green for Completed - final success
  [FundingStatus.Rejected]: "bg-rose-500", // Rose for Rejected - clear negative
  default: "bg-gray-500", // Default color for unknown status
};

export const statusDescriptionMap = {
  [FundingStatus.Submitted]: "Request has been created and received by the organization for review",
  [FundingStatus.Accepted]: "Request has been reviewed and accepted for further processing",
  [FundingStatus.WaitingForSignature]: "Request is approved and waiting for required signatures from stakeholders",
  [FundingStatus.Approved]: "Request has been fully approved with all required signatures completed",
  [FundingStatus.FundsDisbursing]: "Funds are in the process of being transferred to the organization",
  [FundingStatus.Completed]: "All funds have been successfully transferred to the organization",
  [FundingStatus.Rejected]: "Request has been denied and will not proceed further",
};
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = statusColorMap[status] || "bg-gray-500"; // Default to gray if status is unknown
  const description = statusDescriptionMap[status] || "Unknown status";

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip delayDuration={10}>
          <TooltipTrigger asChild>
            <Badge className={`${colorClass} text-white flex items-center gap-1 px-2 py-1 `}>
              <span>{status}</span>
              <Info className="h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <p className="text-sm">{description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

interface DonationAgreementStatusBadgeProps {
  status: "completed" | "pending";
}

export const DonationAgreementStatusBadge: React.FC<DonationAgreementStatusBadgeProps> = ({ status }) => {
  const colorClass = status === "completed" ? "bg-green-500" : "bg-gray-500"; // Default to gray if status is unknown

  return <Badge className={`${colorClass} text-white`}>{status}</Badge>;
};
