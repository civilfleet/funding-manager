import UserForm from "@/components/forms/user";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="flex flex-col w-2/3 p-4">
      <UserForm teamId={teamId} organizationId={""} />
    </div>
  );
}
