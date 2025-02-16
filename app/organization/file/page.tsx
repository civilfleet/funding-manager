import { Button } from "@/components/ui/button";
import Link from "next/link";
export default async function Page() {
  return (
    <div className="p-4 w-full ">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Files</h1>
        <Link href="/organization/funding-request/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
    </div>
  );
}
