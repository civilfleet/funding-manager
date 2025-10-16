import { Eye, EyeOff, Info } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";

interface EmailEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const EmailEditor = ({ value, onChange }: EmailEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Use HTML tags for formatting. Example: &lt;p&gt;Hello&lt;/p&gt;
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2"
        >
          {isPreview ? (
            <>
              <EyeOff className="h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {isPreview ? (
        <div
          className="w-full min-h-[200px] p-4 border rounded-md bg-white"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={value}
          onChange={handleChange}
          className="w-full min-h-[200px] p-4 border rounded-md"
          placeholder="Write your email here..."
        />
      )}
    </div>
  );
};
