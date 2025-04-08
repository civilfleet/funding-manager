"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyRegistrationLinkButtonProps {
  teamId: string;
}

export const CopyRegistrationLinkButton = ({ teamId }: CopyRegistrationLinkButtonProps) => {
  const { toast } = useToast();

  const handleCopyRegistrationLink = () => {
    const registrationLink = `${window.location.origin}/public/${teamId}/register`;
    navigator.clipboard.writeText(registrationLink);
    toast({
      title: "Success",
      description: "Registration link copied to clipboard",
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopyRegistrationLink}
      className="flex items-center gap-2"
    >
      <Copy className="h-4 w-4" />
      Copy Public Registration Link
    </Button>
  );
}; 