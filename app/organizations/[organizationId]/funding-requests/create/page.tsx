import DynamicFundingRequest from "@/components/forms/dynamic-funding-request";
import prisma from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const id = (await params).organizationId as string;
  
  // Get the organization's team to load the correct form configuration
  const organization = await prisma.organization.findUnique({
    where: { id },
    select: { teamId: true },
  });

  return (
    <div className="flex flex-col w-2/3 p-4">
      <DynamicFundingRequest 
        organizationId={id} 
        teamId={organization?.teamId || undefined} 
      />
    </div>
  );
}
