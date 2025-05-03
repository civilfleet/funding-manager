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
  const { data: fundingRequest, isLoading, mutate } = useSWR(`/api/funding-requests/${fundingRequestId}`, fetcher);

  const refreshData = () => {
    mutate();
  };

  return !isLoading && fundingRequest ? (
    <FundingRequestDetails data={fundingRequest?.data} refreshData={refreshData} />
  ) : (
    <div className="flex justify-center items-center h-64">
      <Loader className="" />
    </div>
  );
}
