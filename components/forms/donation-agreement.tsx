"use client";

import { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { createDonationAgreementSchema as schema } from "@/validations/donation-agreement";
import { useToast } from "@/hooks/use-toast";
import { DataSelectBox } from "../helper/data-select-box";
import FileUpload from "../file-uploader";
import FundingRequestDetail from "../funding-request-details";
import { FundingStatus, type FundingRequest } from "@/types";

export default function DonationAgreement({ teamId }: { teamId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fundingRequestId = searchParams.get("fundingRequestId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundingRequestDetail, setFundingRequestDetail] = useState<FundingRequest | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fundingRequestId: fundingRequestId || "",
      agreement: "",
      file: "",
      user: "",
    },
  });

  // Watch changes to form fields
  const fundingRequestIdForm = useWatch({
    control: form.control,
    name: "fundingRequestId",
  });

  const user = useWatch({
    control: form.control,
    name: "user",
  });

  // Add user to the list when selected
  useEffect(() => {
    if (user && user.trim() !== "") {
      if (!users.includes(user)) {
        setUsers([...users, user]);
      }
    }
  }, [user, users]);

  // Remove a user from the list
  const removeUser = (userToRemove: string) => {
    setUsers(users.filter((u) => u !== userToRemove));
  };

  // Fetch funding request details when component mounts or fundingRequestId changes
  useEffect(() => {
    if (!fundingRequestId) {
      setFundingRequestDetail(null);
      return;
    }

    const fetchFundingRequestDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/funding-requests/${fundingRequestId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch funding request: ${response.statusText}`);
        }

        const { data } = await response.json();
        setFundingRequestDetail(data);
        form.setValue("fundingRequestId", fundingRequestId);
      } catch (error) {
        console.error("Error fetching funding request detail:", error);
        setError(error instanceof Error ? error.message : "Failed to load funding request details");
        setFundingRequestDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundingRequestDetail();
  }, [fundingRequestId, form]);

  async function onSubmit(values: z.infer<typeof schema>) {
    if (users.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one user person",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/donation-agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          users: [...users],
          teamId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to create donation agreement: ${response.statusText}`);
      }

      const { data: createdAgreement } = await response.json();

      toast({
        title: "Donation Agreement Created",
        description: "The donation agreement has been successfully created",
        variant: "default",
      });

      // Redirect to view page
      router.push(`/teams/${teamId}/donation-agreements/${createdAgreement?.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create donation agreement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full shadow-xs">
      <CardHeader className="border-b pb-4">
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">Donation Agreement</h1>
        </CardTitle>
        <CardDescription>
          Create a new donation agreement by selecting a funding request and adding user persons
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="donation-agreement-form">
          <CardContent className="space-y-6 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Funding Request Information</h3>

              <Controller
                control={form.control}
                name="fundingRequestId"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <DataSelectBox
                      targetKey="id"
                      url={`/api/funding-requests/?teamId=${teamId}&status=${FundingStatus.Accepted}`}
                      attribute="name"
                      label="Select Funding Request"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">User Persons</h3>

              <Controller
                control={form.control}
                name="user"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <DataSelectBox
                      targetKey="email"
                      url={`/api/users/?teamId=${teamId}${fundingRequestIdForm ? `&fundingRequestId=${fundingRequestIdForm}` : ""}`}
                      attribute="email"
                      label="Select User Person"
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                        // Clear the select after selection
                        setTimeout(() => field.onChange(""), 100);
                      }}
                      disabled={!fundingRequestIdForm}
                    />
                    {!fundingRequestIdForm && (
                      <p className="text-sm text-muted-foreground">Please select a funding request first</p>
                    )}
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />

              {users.length > 0 && (
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-2">Selected User Persons</h4>
                  <div className="flex flex-wrap gap-2">
                    {users.map((person, index) => (
                      <Badge key={index} variant="secondary" className="py-1 px-2">
                        {person}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeUser(person)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Agreement Details</h3>

              <div className="space-y-2">
                <Label htmlFor="agreement">Agreement Text *</Label>
                <Textarea
                  id="agreement"
                  {...form.register("agreement")}
                  placeholder="Enter the details of the donation agreement..."
                  className="min-h-[120px] resize-y"
                />
                {form.formState.errors.agreement && (
                  <p className="text-sm text-destructive">{form.formState.errors.agreement.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Donation Agreement Document</Label>
                <FileUpload
                  placeholder="Drag and drop or click to upload"
                  name="file"
                  data={""}
                  onFileUpload={(url) => form.setValue("file", url)}
                />
                {form.formState.errors.file && (
                  <p className="text-sm text-destructive">{form.formState.errors.file.message}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setUsers([]);
                setFundingRequestDetail(null);
                setError(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting || users.length === 0} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Agreement
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* {fundingRequestDetail && !isLoading && (
        <div className="p-4 bg-muted/30">
          <FundingRequestDetail data={fundingRequestDetail} refreshData={() => {}} />
        </div>
      )} */}
    </Card>
  );
}
