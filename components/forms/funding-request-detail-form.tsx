import { toast } from "@/hooks/use-toast";
import { FileTypes, FundingRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormInputControl from "@/components/helper/form-input-control";
import { Button } from "@/components/ui/button";
import FundingRequestPostData from "@/components/forms/funding-request-post-data";
import { Form } from "@/components/ui/form";

const amountOfferSchema = z.object({
  amountAgreed: z.coerce.number(),
});

export default function FundingRequestDetailsForm({
  data,
  isTeam,
  onUpdate,
}: {
  data: FundingRequest;
  isTeam: boolean | undefined;
  onUpdate?: (updatedData: FundingRequest) => void;
}) {
  const isFundsTransferred = data.status === "FundsTransferred";

  const isFileMissing = (fileType: string) =>
    !isTeam && isFundsTransferred && data.files.filter((file) => file.type === fileType).length === 0;

  const showStatementForm = isFileMissing("STATEMENT");
  const showReportForm = isFileMissing("REPORT");
  const showReceiptForm = isFileMissing("DONATION_RECEIPT");

  const form = useForm<z.infer<typeof amountOfferSchema>>({
    resolver: zodResolver(amountOfferSchema),
    defaultValues: {
      amountAgreed: data.amountAgreed || 0,
    },
  });

  async function onSubmit(values: z.infer<typeof amountOfferSchema>) {
    try {
      const response = await fetch(`/api/funding-requests/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, status: "UnderReview" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update funding request");
      }

      const { data: updatedData } = await response.json();

      if (onUpdate) {
        console.log(updatedData, "updatedData===funding request details form");
        onUpdate(updatedData);
      }

      toast({
        title: "Success",
        description: "Request Submitted Successfully.",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "An error occurred while updating the request",
        variant: "destructive",
      });
    }
  }
  return (
    <>
      {isTeam && !["FundsTransferred", "Rejected"].includes(data.status) && (
        <div className="flex flex-col items-start gap-2 ">
          {/* <h3 className="text-lg font-semibold">Funding Amount</h3> */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center  align-middle ">
                <FormInputControl
                  name="amountAgreed"
                  placeholder="Amount to Offer"
                  type="number"
                  form={form}
                  className="bg-white"
                />
                <Button
                  type="submit"
                  className="btn btn-primary align-bottom ml-2"
                  disabled={form.formState.isSubmitting}
                >
                  Accept Request
                </Button>
              </div>
            </form>
          </Form>
        </div>

        // add button for uploading the donation agreement.
      )}

      {showReceiptForm && (
        <FundingRequestPostData
          title="Upload Receipt"
          description="Upload the receipt after the funds have been transferred in 7 days."
          type={"DONATION_RECEIPT" as FileTypes}
          fundingRequestId={data.id}
        />
      )}

      {showReportForm && (
        <FundingRequestPostData
          title="Upload Report"
          description="Upload the funding request report after the 8 weeks period."
          type={"REPORT" as FileTypes}
          fundingRequestId={data.id}
        />
      )}

      {showStatementForm && (
        <FundingRequestPostData
          title="Upload Budget statement"
          description="Upload the budget statement after the 8 weeks period."
          type={"STATEMENT" as FileTypes}
          fundingRequestId={data.id}
        />
      )}
    </>
  );
}
