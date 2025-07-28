"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import ButtonControl from "../helper/button-control";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const strategicPrioritiesSchema = z.object({
  strategicPriorities: z.string().optional(),
});

interface StrategicPrioritiesFormProps {
  teamId: string;
}

export default function StrategicPrioritiesForm({ teamId }: StrategicPrioritiesFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof strategicPrioritiesSchema>>({
    resolver: zodResolver(strategicPrioritiesSchema),
    defaultValues: {
      strategicPriorities: "",
    },
  });

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const data = await response.json();
          form.reset({
            strategicPriorities: data.strategicPriorities || "",
          });
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, [teamId, form]);

  async function onSubmit(values: z.infer<typeof strategicPrioritiesSchema>) {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || response.statusText,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Strategic priorities updated successfully",
        variant: "default",
      });

      router.refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registration Page Information</CardTitle>
        <CardDescription>
          Configure the text that appears on your public registration page to inform organizations about your strategic priorities and available grants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="strategicPriorities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategic Priorities & Available Grants</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter information about your team's strategic priorities, available grants, and any other details organizations should know when registering..."
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    This text will be displayed prominently at the top of your public registration page to help organizations understand your focus areas and available funding opportunities.
                  </p>
                </FormItem>
              )}
            />

            <ButtonControl 
              className="w-32" 
              type="submit" 
              disabled={form.formState.isSubmitting}
              label="Save Changes"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}