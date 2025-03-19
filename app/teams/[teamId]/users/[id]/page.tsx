import UserDetails from "@/components/user-details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`
  );
  const { data } = await response.json();
  return (
    <div className="p-4 w-full">
      <UserDetails user={data} />
    </div>
  );
}
