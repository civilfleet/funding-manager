import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import get from "lodash/get";

type DataSelectBoxProps = {
  url: string;
  label: string;
  attribute: string;
  value: string | null;
  targetKey: string;
  onChange: (value: string) => void;
};

type Option = {
  id: string | number;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function DataSelectBox({
  url,
  label,
  attribute,
  value,
  targetKey,
  onChange,
}: DataSelectBoxProps) {
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const { data } = await response.json();
        setOptions(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return (
    <Select onValueChange={onChange} value={value ?? ""}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={loading ? "Loading..." : label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options?.map((option, idx) => {
            const optionValue = get(option, attribute, "Not Available");
            const optionId = get(option, targetKey, "Not Available");

            return (
              <SelectItem key={idx} value={String(optionId)}>
                {optionValue}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
