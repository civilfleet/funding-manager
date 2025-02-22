import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Organization() {
  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Donations Agreements</h1>
        <Link href="/team/donation-agreement/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
      {/* <OrganizationTable /> */}
    </div>
  );
}
