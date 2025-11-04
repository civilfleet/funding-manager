import OrganizationForm from "@/components/forms/organization";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4">
      <OrganizationForm
        data={{
          name: undefined,
          email: "",
          address: undefined,
          city: undefined,
          country: undefined,
          phone: undefined,
          website: undefined,
          postalCode: undefined,
          taxExemptionCertificate: undefined,
          taxID: undefined,
          bankDetails: undefined,
          user: undefined,
          id: "",
          isFilledByOrg: false,
          teamId: teamId,
        }}
      />
    </div>
  );
}
