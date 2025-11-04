"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { DataTable } from "@/components/data-table";
import {
  columns,
  type OrganizationColumns,
} from "@/components/table/organization-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ButtonControl from "../helper/button-control";
import FormInputControl from "../helper/form-input-control";
import { Loader } from "../helper/loader";

const querySchema = z.object({
  query: z.string(),
});
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface IOrganizationProps {
  teamId?: string;
}

export default function OrganizationTable({ teamId }: IOrganizationProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query"); // Get current query value

  const { data, error, isLoading, mutate } = useSWR(
    `/api/organizations?${isAdmin ? "" : `teamId=${teamId}&`}query=${query}`,
    fetcher,
  );
  const loading = isLoading || !data;

  if (error) {
    toast({
      title: "Error",
      description: "Error fetching organizations",
      variant: "destructive",
    });
  }

  async function onSubmit(values: z.infer<typeof querySchema>) {
    form.setValue("query", values.query); // Triggers SWR to re-fetch
  }

  return (
    <div className="my-2 flex flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <FormInputControl
              form={form}
              name="query"
              placeholder="Search..."
            />
          </div>

          <ButtonControl
            type="submit"
            label="Submit"
            className="w-full sm:mx-2 sm:w-auto"
          />
        </form>
      </Form>

      <div
        className="my-2 flex h-full grow items-center justify-center rounded-md border p-2 sm:p-4"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns(mutate)}
              data={data?.data}
              initialView="table"
              renderCard={(org: OrganizationColumns) => (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-tight">
                        {org.name || "Untitled Organization"}
                      </CardTitle>
                      <Badge
                        variant={org.isFilledByOrg ? "default" : "secondary"}
                      >
                        {org.isFilledByOrg
                          ? "Self-Registered"
                          : "Admin-Registered"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="break-all font-medium">
                        {org.email || "N/A"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Team
                        </div>
                        <div className="font-medium">
                          {org.team?.name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Country
                        </div>
                        <div className="font-medium">
                          {org.country || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Phone
                        </div>
                        <div className="font-medium">
                          {org.phone || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Website
                        </div>
                        <div className="font-medium">
                          {org.website ? (
                            <Link
                              href={
                                org.website.startsWith("http")
                                  ? org.website
                                  : `https://${org.website}`
                              }
                              target="_blank"
                              className="text-blue-600 hover:underline"
                            >
                              {org.website}
                            </Link>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Link href={`organizations/${org.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
