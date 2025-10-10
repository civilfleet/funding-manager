"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import ButtonControl from "../helper/button-control";
import { DataTable } from "@/components/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { columns, type OrganizationColumns } from "@/components/table/organization-columns";
import FormInputControl from "../helper/form-input-control";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import { Loader } from "../helper/loader";
import { usePathname } from "next/navigation";
import { useTeamStore } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    fetcher
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
      grow h-full"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="" />
          </div>
        ) : (
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
                    <Badge variant={org.isFilledByOrg ? "default" : "secondary"}>
                      {org.isFilledByOrg ? "Self-Registered" : "Admin-Registered"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-medium break-all">{org.email || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Team</div>
                      <div className="font-medium">{org.team?.name || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Country</div>
                      <div className="font-medium">{org.country || "N/A"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="font-medium">{org.phone || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Website</div>
                      <div className="font-medium truncate">
                        {org.website ? (
                          <Link
                            href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
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
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          />
        )}
      </div>
    </div>
  );
}

