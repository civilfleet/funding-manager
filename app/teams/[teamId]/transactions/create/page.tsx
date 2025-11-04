interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function Page({ params }: PageProps) {
  await params;
  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl  my-2">Create Transaction</h1>
      </div>
    </div>
  );
}
