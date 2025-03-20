"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import OrganizationDetails from "@/components/organization-details";
import { Loader } from "@/components/helper/loader";
import OrganizationForm from "@/components/forms/organization";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Roles } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrganizationData({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data: session } = useSession();
  const showEditButton =
    session?.user.roles?.includes(Roles.Admin) ||
    session?.user.roles?.includes(Roles.Team);

  const {
    data: organizationData,
    isLoading: orgLoading,
    mutate,
  } = useSWR(`/api/organizations/${organizationId}`, fetcher);

  const { data: fundingRequestsData, isLoading: fundingLoading } = useSWR(
    `/api/funding-requests/?organizationId=${organizationId}`,
    fetcher
  );

  const [isFilledByOrg, setIsFilledByOrg] = useState(false);

  useEffect(() => {
    if (organizationData?.data) {
      setIsFilledByOrg(organizationData.data.isFilledByOrg);
    }
  }, [organizationData?.data]);

  if (orgLoading || fundingLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className={""} />
      </div>
    );
  }

  const allowEditOrganization = async () => {
    const newValue = !isFilledByOrg;
    setIsFilledByOrg(newValue);

    try {
      await fetch(`/api/organizations/${organizationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFilledByOrg: newValue,
        }),
      });

      await mutate();

      toast({
        title: "Success",
        description: "Organization updated",
      });
    } catch (error) {
      console.log(error);
      setIsFilledByOrg(!newValue);

      toast({
        title: "Error",
        description: "Error updating organization",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-5 py-1">
      {isFilledByOrg ? (
        <OrganizationDetails
          organization={organizationData?.data}
          fundingRequests={fundingRequestsData?.data}
        />
      ) : (
        <OrganizationForm data={organizationData?.data} />
      )}

      {showEditButton && (
        <div className="flex flex-row items-center justify-between mt-4">
          <h2 className="text-lg font-semibold">Allow edit organization</h2>
          <Switch
            checked={isFilledByOrg}
            onCheckedChange={allowEditOrganization}
          />
        </div>
      )}
    </div>
  );
}
