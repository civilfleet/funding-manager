"use client";
import { useState, useId } from "react";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { SquareArrowOutUpRight } from "lucide-react";
import { Loader } from "@/components/helper/loader";

interface FileUploadProps {
  onFileUpload: (fileUrl: string) => void;
  placeholder?: string;
  name?: string;
  error?: string;
  data?: string;
  disabled?: boolean;
  label?: string;
}

const FileUpload = ({
  onFileUpload,
  placeholder,
  name,
  data,
  error,
  disabled = false,
  label,
}: FileUploadProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(data || null);
  const [loading, setLoading] = useState(false);
  const inputId = useId();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const upload = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { putUrl } = await upload.json();

      const uploadFile = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (uploadFile.ok) {
        const fileUrl = putUrl.split("?")[0].split("/").pop(); // Remove query params
        setFileUrl(fileUrl);
        onFileUpload(fileUrl); // Send file URL to parent
        setLoading(false);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <FloatingLabelInput
        id={inputId}
        label={label || placeholder}
        type="file"
        className="pr-10"
        onChange={handleFileChange}
        name={name}
        disabled={disabled}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader className="text-gray-950" />
        </div>
      )}

      {error && <p className="text-red-500 text-xs ">{error}</p>}
    </div>
  );
};

export default FileUpload;
