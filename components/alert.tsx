import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UseFormReturn } from "react-hook-form";
import { buttonVariants } from "./ui/button";
export default function Alert({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. ",
  form,
  formId,
}: {
  title: string;
  description: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  form: UseFormReturn | any | undefined;
  formId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={buttonVariants({ variant: "default" })}
        type="button"
      >
        Submit
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="w-24"
            type="submit"
            form={formId}
            disabled={form.formState.isSubmitting}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
