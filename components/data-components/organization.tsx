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

export default function OrganizationData({ organizationId }: { organizationId: string }) {
  const { data: session } = useSession();
  const isAdminOrTeam = session?.user.roles?.includes(Roles.Admin) || session?.user.roles?.includes(Roles.Team);

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
    <div className="container px-5 py-8 mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isAdminOrTeam && (
          <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-800">Organization Edit Mode</h3>
              <p className="text-sm text-gray-600 mt-1">
                {isFilledByOrg
                  ? "Edit mode is locked. Organization details can only be viewed by the organization."
                  : "Edit mode is active. Organization can modify organization details."}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">{isFilledByOrg ? "Unlock" : "Lock"}</span>
              <Switch
                checked={isFilledByOrg}
                onCheckedChange={allowEditOrganization}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        )}

        {isFilledByOrg && !isAdminOrTeam ? (
          <OrganizationDetails organization={organizationData?.data} fundingRequests={fundingRequestsData?.data} />
        ) : (
          <OrganizationForm data={organizationData?.data} />
        )}
      </div>
    </div>
  );
}
