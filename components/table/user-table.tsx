"use client";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/table/user-columns";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import ButtonControl from "../helper/button-control";
import FormInputControl from "../helper/form-input-control";
import { Loader } from "../helper/loader";
import { Form } from "../ui/form";

interface UserTableProps {
  teamId: string;
  organizationId: string;
}

const querySchema = z.object({
  query: z.string(),
});
const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function UserTable({ teamId, organizationId }: UserTableProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  const { data, error, isLoading } = useSWR(
    `/api/users?teamId=${teamId}&query=${query}&organizationId=${organizationId}`,
    fetcher,
  );
  const loading = isLoading || !data;
  const ownerId = data?.ownerId as string | undefined;

  if (error) {
    toast({
      title: "Error",
      description: "Error fetching funding requests",
      variant: "destructive",
    });
  }

  async function onSubmit(values: z.infer<typeof querySchema>) {
    form.setValue("query", values.query);
  }

  return (
    <div className="flex flex-col my-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-1/2">
          <div className="flex-1">
            <FormInputControl
              form={form}
              name="query"
              placeholder="Search..."
            />
          </div>

          <ButtonControl type="submit" label="Submit" className="mx-2" />
        </form>
      </Form>
      <div
        className="rounded-md border my-2 flex  justify-center items-center
      grow h-full"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={
              (data?.data || []).map((user: User) => ({
                ...user,
                isOwner: ownerId ? user.id === ownerId : false,
              }))
            }
          />
        )}
      </div>
    </div>
  );
}
