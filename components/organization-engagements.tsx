"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createOrganizationEngagementSchema } from "@/validations/organization-engagements";

type OrganizationEngagement = {
  id: string;
  type: string;
  note?: string | null;
  engagedAt: string;
};

interface OrganizationEngagementsProps {
  organizationId: string;
  teamId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDateForInput = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function OrganizationEngagements({
  organizationId,
  teamId,
}: OrganizationEngagementsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: engagementsData, mutate } = useSWR(
    `/api/organization-engagements?organizationId=${organizationId}&teamId=${teamId}`,
    fetcher,
  );

  const engagements = useMemo<OrganizationEngagement[]>(
    () => engagementsData?.data || [],
    [engagementsData],
  );

  const form = useForm<z.infer<typeof createOrganizationEngagementSchema>>({
    resolver: zodResolver(createOrganizationEngagementSchema),
    defaultValues: {
      organizationId,
      teamId,
      type: "",
      note: "",
      engagedAt: formatDateForInput(),
    },
  });

  const onSubmit = async (
    values: z.infer<typeof createOrganizationEngagementSchema>,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/organization-engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to add engagement");
      }

      toast({
        title: "Engagement added",
        description: "Cooperation history updated.",
      });

      form.reset({
        organizationId,
        teamId,
        type: "",
        note: "",
        engagedAt: formatDateForInput(),
      });
      mutate();
    } catch (error) {
      toast({
        title: "Unable to add engagement",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Cooperation History</CardTitle>
        <CardDescription>
          Track collaborations and important touchpoints with this organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Workshop, support request, meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="engagedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about this collaboration..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add entry"
              )}
            </Button>
          </form>
        </Form>

        {engagements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cooperation history recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {engagements.map((engagement) => (
              <div
                key={engagement.id}
                className="rounded-md border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{engagement.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(engagement.engagedAt).toLocaleDateString()}
                  </span>
                </div>
                {engagement.note && (
                  <p className="text-sm text-muted-foreground">
                    {engagement.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
