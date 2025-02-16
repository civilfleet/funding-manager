import ContactPersonTable from "@/components/table/contact-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Contacts</h1>
        <Link href="contact/create">
          <Button type="button">Create New</Button>
        </Link>
      </div>
      <ContactPersonTable />
    </div>
  );
}
