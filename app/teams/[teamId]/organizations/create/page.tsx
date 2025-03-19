import OrganizationForm from "@/components/forms/organization";

export default function Page() {
  return (
    <div className="flex flex-col w-2/3 p-4">
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
        }}
      />
    </div>
  );
}
