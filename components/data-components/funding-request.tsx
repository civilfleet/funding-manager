"use client";

import useSWR from "swr";
import { Loader } from "@/components/helper/loader";
import FundingRequestDetails from "../funding-request-details";

export default function FundingRequestData({
  fundingRequestId,
  teamId,
  organizationId,
}: {
  fundingRequestId: string;
  teamId?: string;
  organizationId?: string;
}) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: fundingRequests,

    isLoading,
  } = useSWR(`/api/funding-requests/${fundingRequestId}`, fetcher);

  const fundingRequest = fundingRequests?.data;

  return !isLoading ? (
    <FundingRequestDetails data={fundingRequest} teamId={teamId} organizationId={organizationId} />
  ) : (
    <div className="flex justify-center items-center h-64">
      <Loader className="" />
    </div>
  );
}
