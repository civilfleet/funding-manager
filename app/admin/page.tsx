import TeamForm from "@/components/forms/team";
import OrganizationTable from "@/components/table/organization-table";

export default async function team() {
  return (
    <div className="m-2 w-full">
      <TeamForm />
    </div>
  );
}
