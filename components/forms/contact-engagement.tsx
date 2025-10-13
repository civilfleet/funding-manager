"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EngagementDirection, EngagementSource } from "@/types";

const engagementSchema = z.object({
  direction: z.enum([EngagementDirection.INBOUND, EngagementDirection.OUTBOUND]),
  source: z.enum([
    EngagementSource.EMAIL,
    EngagementSource.PHONE,
    EngagementSource.SMS,
    EngagementSource.MEETING,
    EngagementSource.EVENT,
    EngagementSource.OTHER,
  ]),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  engagedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

type EngagementFormValues = z.infer<typeof engagementSchema>;

interface ContactEngagementFormProps {
  contactId: string;
  teamId: string;
  onSuccess?: () => void;
}

const formatDateForInput = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ContactEngagementForm({
  contactId,
  teamId,
  onSuccess,
}: ContactEngagementFormProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EngagementFormValues>({
    resolver: zodResolver(engagementSchema),
    defaultValues: {
      direction: EngagementDirection.OUTBOUND,
      source: EngagementSource.EMAIL,
      subject: "",
      message: "",
      engagedAt: formatDateForInput(),
    },
  });

  const onSubmit = async (values: EngagementFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact-engagements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId,
          teamId,
          ...values,
          userId: session?.user?.id,
          userName: session?.user?.name || session?.user?.email,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to create engagement");
      }

      toast({
        title: "Engagement recorded",
        description: "Contact engagement has been successfully recorded.",
      });

      form.reset({
        direction: EngagementDirection.OUTBOUND,
        source: EngagementSource.EMAIL,
        subject: "",
        message: "",
        engagedAt: formatDateForInput(),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Unable to record engagement",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EngagementDirection.OUTBOUND}>
                      Outbound (Sent to contact)
                    </SelectItem>
                    <SelectItem value={EngagementDirection.INBOUND}>
                      Inbound (Received from contact)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EngagementSource.EMAIL}>Email</SelectItem>
                    <SelectItem value={EngagementSource.PHONE}>Phone Call</SelectItem>
                    <SelectItem value={EngagementSource.SMS}>SMS</SelectItem>
                    <SelectItem value={EngagementSource.MEETING}>Meeting</SelectItem>
                    <SelectItem value={EngagementSource.EVENT}>Event</SelectItem>
                    <SelectItem value={EngagementSource.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="engagedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement Date & Time *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>When did this engagement occur?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Follow-up on funding request" {...field} />
              </FormControl>
              <FormDescription>Optional subject or title for the engagement</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter details about this engagement..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the content or outcome of this engagement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              "Record Engagement"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
