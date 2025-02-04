import OrganizationForm from "@/components/forms/organization-form";

export default function Page() {
  return (
    <div className="flex flex-col w-2/3 ">
      <OrganizationForm
        data={{
          name: undefined,
          email: "",
          address: undefined,
          postalCode: undefined,
          city: undefined,
          country: undefined,
          phone: undefined,
          website: undefined,
          taxExemptionCertificate: undefined,
          taxID: undefined,
          bankDetails: undefined,
          contactPerson: undefined,
        }}
      />
    </div>
  );
}
