import { Badge } from "@/components/ui/badge"; // Adjust the import path based on your project structure
import { FundingStatus } from "@/types";

interface StatusBadgeProps {
  status: FundingStatus;
}

const statusColorMap = {
  [FundingStatus.Pending]: "bg-yellow-500", // Yellow for Pending
  [FundingStatus.UnderReview]: "bg-blue-500", // Blue for UnderReview
  [FundingStatus.Processing]: "bg-purple-500", // Purple for Processing
  [FundingStatus.Approved]: "bg-green-500", // Green for Approved
  [FundingStatus.FundsTransferred]: "bg-teal-500", // Teal for FundsTransferred
  [FundingStatus.Rejected]: "bg-red-500", // Red for Rejected
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = statusColorMap[status] || "bg-gray-500"; // Default to gray if status is unknown

  return <Badge className={`${colorClass} text-white`}>{status}</Badge>;
};

interface DonationAgreementStatusBadgeProps {
  status: "completed" | "pending";
}

export const DonationAgreementStatusBadge: React.FC<DonationAgreementStatusBadgeProps> = ({ status }) => {
  const colorClass = status === "completed" ? "bg-green-500" : "bg-gray-500"; // Default to gray if status is unknown

  return <Badge className={`${colorClass} text-white`}>{status}</Badge>;
};
