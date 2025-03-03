import { useForm } from "react-hook-form";
import { Building } from "lucide-react"; // Assuming you're using Lucide icons
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Adjust the import path based on your project structure
import FileUpload from "../file-uploader";
import { FileTypes } from "@/types";
import { Label } from "@radix-ui/react-label";
import ButtonControl from "../helper/button-control";
import { Form } from "../ui/form";
import { toast } from "@/hooks/use-toast";

interface ReceiptFormData {
  url: string;
}
export default function FundingRequestPostData({
  fundingRequestId,
  title,
  description,
  type,
}: {
  fundingRequestId: string;
  title: string;
  description: string;
  type: FileTypes;
}) {
  const form = useForm<ReceiptFormData>();

  const onSubmit = async (data: ReceiptFormData) => {
    console.log("Form Data:", data);
    try {
      const response = await fetch(
        `/api/funding-request/${fundingRequestId}/file`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: data.url,
            type,
          }),
        }
      );
      if (!response.ok) {
        toast({
          title: "Error",
          description: response?.statusText,
          variant: "destructive",
        });
        return;
      }
      await response.json();
      toast({
        title: "Success",
        description: "File uploaded successfully",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (url: string) => {
    console.log("File Uploaded:", url);
    form.setValue("url", url);
    // Set the file URL in the form state if needed
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <Label className="text-sm text-gray-500 my-2">{description}</Label>

            <FileUpload
              placeholder="Upload file"
              name="file"
              data={""}
              error={
                form?.formState?.errors?.url
                  ? (form.formState.errors?.url?.message as string)
                  : ""
              }
              onFileUpload={(url) => handleFileUpload(url)}
            />

            {/* Submit Button */}
            <ButtonControl
              type="submit"
              label="Submit"
              className=" my-2 "
              disabled={form.watch("url") === undefined}
              loading={false}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
