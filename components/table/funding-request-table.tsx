"use client";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { columns } from "@/components/table/funding-request-columns";
import { useToast } from "@/hooks/use-toast";
import { Form } from "../ui/form";
import FormInputControl from "../helper/form-input-control";
import ButtonControl from "../helper/button-control";
import useSWR from "swr";
import { Loader } from "../helper/loader";

import { useParams } from "next/navigation";

const querySchema = z.object({
  query: z.string(),
});
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FundingRequestTable() {
  const { toast } = useToast();
  const params = useParams();

  const teamId = params?.teamId ? params?.teamId : "";
  const organizationId = params?.organizationId ? params.organizationId : "";

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  const { data, error, isLoading } = useSWR(
    `/api/funding-requests?teamId=${teamId}&organizationId=${organizationId}&query=${query}`,
    fetcher
  );
  const loading = isLoading || !data;

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
            <FormInputControl form={form} name="query" placeholder="Search..." />
          </div>

          <ButtonControl type="submit" label="Submit" className="mx-2" />
        </form>
      </Form>
      <div
        className="rounded-md border my-2 flex justify-center items-center
      flex-grow h-full"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="" />
          </div>
        ) : (
          <DataTable columns={columns} data={data?.data} />
        )}
      </div>
    </div>
  );
}
