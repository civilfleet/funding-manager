import OrganizationForm from "@/components/forms/organization-form";

export default function Page() {
  return (
    <div className="flex flex-col w-2/3 ">
      <OrganizationForm
        data={{
          email: "",
        }}
      />
    </div>
  );
}
