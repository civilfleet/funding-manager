"use client";
import { z } from "zod";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { columns } from "@/components/table/funding-request-columns";
import { useToast } from "@/hooks/use-toast";
import { Form } from "../ui/form";
import FormInputControl from "../helper/FormInputControl";
import ButtonControl from "../helper/ButtonControl";
import { useSession } from "next-auth/react";

const querySchema = z.object({
  query: z.string(),
});

export default function FundingRequestTable() {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("session", session);

        const response = await fetch(`/api/funding-request/?query=`);
        const { data } = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching FundingsRequest:", error);
        toast({
          title: "Error",
          description: "Error fetching FundingsRequest",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, []);

  async function onSubmit(values: z.infer<typeof querySchema>) {
    try {
      const response = await fetch(
        `/api/funding-request?query=${values.query}`
      );
      const { data } = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching funding requests:", error);
      toast({
        title: "Error",
        description: "Error fetching funding requests",
        variant: "destructive",
      });
    }
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
        className="rounded-md border my-2 flex 
      flex-grow h-full"
      >
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
