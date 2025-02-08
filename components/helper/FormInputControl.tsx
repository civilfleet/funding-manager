import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
export default function FormInputControl({
  form,
  name,
  label,
  placeholder,
  disabled = false,
  type,
}: {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  form: UseFormReturn | any | undefined;
  name: string;
  label?: string;
  placeholder: string;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute | undefined;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              disabled={disabled}
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
