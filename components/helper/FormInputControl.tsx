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
}: {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  form: UseFormReturn | any | undefined;
  name: string;
  label?: string;
  placeholder: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
