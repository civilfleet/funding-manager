import FundingRequestTable from "@/components/table/funding-request-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default async function Page() {
  return (
    <div className="p-4 w-full ">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Funding Requests</h1>
      </div>

      <FundingRequestTable />
    </div>
  );
}
