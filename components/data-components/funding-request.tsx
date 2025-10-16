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
  const { data, isLoading, mutate } = useSWR(
    `/api/funding-requests/${fundingRequestId}`,
    fetcher,
  );
  const fundingRequest = data?.data;

  const refreshData = () => {
    console.log("Refreshing data");
    mutate(`/api/funding-requests/${fundingRequestId}`);
  };

  return !isLoading && fundingRequest ? (
    <FundingRequestDetails data={fundingRequest} refreshData={refreshData} />
  ) : (
    <div className="flex justify-center items-center h-64">
      <Loader className="" />
    </div>
  );
}
