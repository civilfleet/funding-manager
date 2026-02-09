import TeamOrganizationsPage from "@/components/organizations/team-organizations-page";

export default async function FundingOrganizationsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamOrganizationsPage teamId={teamId} scope="funding" />;
}
