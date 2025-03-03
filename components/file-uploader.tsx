"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SquareArrowOutUpRight } from "lucide-react";
import { Loader } from "@components/helper/loader";

interface FileUploadProps {
  onFileUpload: (fileUrl: string) => void;
  placeholder?: string;
  name?: string;
  error?: string;
  data?: string;
}

const FileUpload = ({
  onFileUpload,
  placeholder,
  name,
  data,
  error,
}: FileUploadProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(data || null);
  const [loading, setLoading] = useState(false);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <Input
        type="file"
        className="pr-10"
        onChange={handleFileChange}
        placeholder={placeholder}
        name={name}
      />

      <a
        href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${fileUrl}` || ""}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
      >
        {loading ? (
          <Loader className="text-gray-950" />
        ) : (
          fileUrl && <SquareArrowOutUpRight className="size-4" />
        )}
      </a>

      {error && <p className="text-red-500 text-xs ">{error}</p>}
    </div>
  );
};

export default FileUpload;
