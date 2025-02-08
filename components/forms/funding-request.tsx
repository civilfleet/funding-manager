"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFundingRequestSchema } from "@/validations/funding-request";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import ButtonControl from "../helper/ButtonControl";
import FormInputControl from "../helper/FormInputControl";
import { useSession } from "next-auth/react";

type FundingRequest = {
  description: string;
  purpose: string;
  amountRequested: string;
  refinancingConcept: string;
  sustainability: string;
  expectedCompletionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  files: string;
};
export default function FundingRequest() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof createFundingRequestSchema>>({
    resolver: zodResolver(createFundingRequestSchema),
    defaultValues: {
      description: "",
      purpose: "",
      amountRequested: 0,
      refinancingConcept: "",
      sustainability: "",
      expectedCompletionDate: "",
      status: "",
      files: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createFundingRequestSchema>) {
    try {
      const response = await fetch("/api/funding-request", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          organizationId: session?.user.organizationId,
          submittedBy: session?.user.email,
        }),
      });

      // check for error
      if (response.status == 400) {
        toast({
          title: "Error",
          description: response.statusText,
          variant: "destructive",
        });
        return;
      }

      await response.json();
      toast({
        title: "Success",
        description: "Request Submitted Successfully. ",
        variant: "default",
      });
      form.reset();
    } catch (e) {
      toast({
        title: "Error",
        description: JSON.stringify(e),
      });
    }
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Funding Requests.</CardTitle>
        <CardDescription>
          Please provide the following information to request funding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Description"
                />
              </FormControl>
            </FormItem>

            {form.formState.errors.description && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.description.message}
              </p>
            )}

            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Textarea
                  id="purpose"
                  {...form.register("purpose")}
                  placeholder="Purpose"
                />
              </FormControl>
            </FormItem>
            {form.formState.errors.purpose && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.purpose.message}
              </p>
            )}
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Textarea
                  id="refinancingConcept"
                  {...form.register("refinancingConcept")}
                  placeholder="Refinancing Concept"
                />
              </FormControl>
            </FormItem>
            {form.formState.errors.refinancingConcept && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.refinancingConcept.message}
              </p>
            )}
            <FormItem>
              <FormLabel>Sustainability</FormLabel>
              <FormControl>
                <Textarea
                  {...form.register("sustainability")}
                  placeholder="Sustainability"
                  id="sustainability"
                />
              </FormControl>
            </FormItem>
            {form.formState.errors.sustainability && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.sustainability.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormInputControl
                name="expectedCompletionDate"
                placeholder="Expected Completion Date"
                type="datetime-local"
                label="Expected Completion Date"
                form={form}
              />
              <FormInputControl
                name="amountRequested"
                placeholder="Amount Requested"
                type="number"
                label="Amount Request:"
                form={form}
              />
            </div>
            {/* <Textarea name="files" placeholder="Files" /> */}
            <div className="grid grid-cols-2 gap-4"></div>
            <ButtonControl
              className="w-24"
              type="submit"
              loading={form.formState.isSubmitting}
              label="Save"
              variant={"default"}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
