"use client";
import { z } from "zod";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ButtonControl from "../helper/button-control";
import { DataTable } from "@/components/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrganizationColumns,
  columns,
} from "@/components/table/organization-columns";
import FormInputControl from "../helper/form-input-control";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const querySchema = z.object({
  query: z.string(),
});

export default function OrganizationTable() {
  const { toast } = useToast();
  const [data, setData] = useState<OrganizationColumns[]>([]);
  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/organizations?query=");
        const { data } = await response.json();
        if (!data) {
          toast({
            title: "Error",
            description: "Error fetching organizations",
            variant: "destructive",
          });
        }
        setData(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast({
          title: "Error",
          description: "Error fetching organizations",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, []);

  async function onSubmit(values: z.infer<typeof querySchema>) {
    try {
      const response = await fetch(`/api/organizations?query=${values.query}`);
      const { data } = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast({
        title: "Error",
        description: "Error fetching organizations",
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
        {data && <DataTable columns={columns} data={data} />}
      </div>
    </div>
  );
}
