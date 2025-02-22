import { Button } from "@/components/ui/button";
import { Loader } from "./loader";
export default function FormInputControl({
  type = "submit",
  label = "Submit",
  variant = "default",
  disabled = false,
  loading = false,
  className = "",
}: {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type: "submit" | "reset" | "button";
  label?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}) {
  return (
    <Button
      type={type}
      variant={variant}
      className={className}
      disabled={disabled || loading}
    >
      {loading ? <Loader className="text-white" /> : <span>{label}</span>}
    </Button>
  );
}
