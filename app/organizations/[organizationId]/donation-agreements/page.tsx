import DonationAgreementTable from "@/components/table/donation-agreement-table";

export default async function Organization() {
  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Donations Agreements</h1>
      </div>
      {/* <OrganizationTable /> */}
      <DonationAgreementTable />
    </div>
  );
}
