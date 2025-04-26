import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormInputControl({
  form,
  name,
  label,
  placeholder,
  disabled = false,
  type,
  isFilled = false,
  className,
}: {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  form: UseFormReturn | any | undefined;
  name: string;
  label?: string;
  placeholder: string;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute | undefined;
  isFilled?: boolean;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                disabled={disabled}
                type={type}
                placeholder={placeholder}
                className={cn(isFilled && "bg-green-50 border-green-200", "pr-8", className)}
                {...field}
              />
              {isFilled && <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
