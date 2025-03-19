"use client";

import useSWR from "swr";
import OrganizationDetails from "@/components/organization-details";
import { Loader } from "@/components/helper/loader";
import OrganizationForm from "@/components/forms/organization";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrganizationData({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data: organizationData, isLoading: orgLoading } = useSWR(
    `/api/organizations/${organizationId}`,
    fetcher
  );

  const { data: fundingRequestsData, isLoading: fundingLoading } = useSWR(
    `/api/funding-requests/?organizationId=${organizationId}`,
    fetcher
  );

  if (orgLoading || fundingLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className={""} />
      </div>
    );
  }

  return (
    <div className="container px-5 py-1">
      {organizationData?.data?.isFilledByOrg ? (
        <OrganizationDetails
          organization={organizationData?.data}
          fundingRequests={fundingRequestsData?.data}
        />
      ) : (
        <OrganizationForm data={organizationData?.data} />
      )}
    </div>
  );
}
