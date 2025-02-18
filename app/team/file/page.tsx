import FileTable from "@/components/table/file-table";

export default async function Page() {
  return (
    <div className="p-4 w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Files</h1>
      </div>
      <FileTable />
    </div>
  );
}
