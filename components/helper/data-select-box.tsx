import get from "lodash/get";
import * as React from "react";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type DataSelectBoxProps = {
  url: string;
  label: string;
  attribute: string;
  value: string | null;
  targetKey: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

type Option = {
  id: string | number;
  [key: string]: unknown;
};

export function DataSelectBox({
  url,
  label,
  attribute,
  value,
  targetKey,
  disabled,
  onChange,
}: DataSelectBoxProps) {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const { data } = await response.json();
    return data;
  };

  const { data, error, isLoading } = useSWR(url, fetcher);
  const options: Option[] = data ?? [];
  if (error) {
    toast({
      title: "Error",
      description: "Error fetching data",
      variant: "destructive",
    });
  }
  return (
    <Select onValueChange={onChange} value={value ?? ""} disabled={disabled}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={isLoading ? "Loading..." : label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options?.map((option, idx) => {
            const optionValue = get(option, attribute, "Not Available");
            const optionId = get(option, targetKey, "Not Available");

            return (
              <SelectItem key={idx} value={String(optionId)}>
                {String(optionValue)}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
