"use client";

import useSWR from "swr";
import { DataTable } from "@/components/data-table";
import { useToast } from "@/hooks/use-toast";
import { columns } from "./teams-columns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeamsTable() {
  const { toast } = useToast();
  const { data, error, mutate } = useSWR("/api/teams", fetcher);

  if (error) {
    toast({
      title: "Error",
      description: "Error fetching teams",
      variant: "destructive",
    });
  }

  return (
    <div className="rounded-md border">
      <DataTable columns={columns(mutate)} data={data?.data || []} />
    </div>
  );
}
