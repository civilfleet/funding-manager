"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Plus, MessageSquare, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader } from "@/components/helper/loader";
import ContactEngagementForm from "@/components/forms/contact-engagement";
import { ContactEngagement, EngagementDirection, EngagementSource } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContactEngagementHistoryProps {
  contactId: string;
  teamId: string;
}

const getSourceColor = (source: EngagementSource) => {
  switch (source) {
    case EngagementSource.EMAIL:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case EngagementSource.PHONE:
      return "bg-green-100 text-green-800 border-green-200";
    case EngagementSource.SMS:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case EngagementSource.MEETING:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case EngagementSource.EVENT:
      return "bg-pink-100 text-pink-800 border-pink-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getSourceLabel = (source: EngagementSource) => {
  switch (source) {
    case EngagementSource.EMAIL:
      return "Email";
    case EngagementSource.PHONE:
      return "Phone";
    case EngagementSource.SMS:
      return "SMS";
    case EngagementSource.MEETING:
      return "Meeting";
    case EngagementSource.EVENT:
      return "Event";
    case EngagementSource.OTHER:
      return "Other";
    default:
      return source;
  }
};

export default function ContactEngagementHistory({
  contactId,
  teamId,
}: ContactEngagementHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/contact-engagements?contactId=${contactId}&teamId=${teamId}`,
    fetcher
  );

  const engagements = (data?.data || []) as ContactEngagement[];

  const handleSuccess = () => {
    mutate();
    setIsDialogOpen(false);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Engagement History</CardTitle>
            <CardDescription>Track all interactions with this contact</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Record Engagement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Engagement</DialogTitle>
                <DialogDescription>
                  Log a new interaction or communication with this contact
                </DialogDescription>
              </DialogHeader>
              <ContactEngagementForm
                contactId={contactId}
                teamId={teamId}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Failed to load engagement history
          </div>
        ) : engagements.length === 0 ? (
          <div className="text-center py-8 rounded-md border border-dashed">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No engagements recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Record Engagement&quot; to add your first interaction
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {engagements.map((engagement, index) => (
              <div key={engagement.id}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        engagement.direction === EngagementDirection.OUTBOUND
                          ? "bg-blue-100"
                          : "bg-green-100"
                      }`}
                    >
                      {engagement.direction === EngagementDirection.OUTBOUND ? (
                        <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {index < engagements.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getSourceColor(engagement.source)}`}
                        >
                          {getSourceLabel(engagement.source)}
                        </Badge>
                        <Badge
                          variant={
                            engagement.direction === EngagementDirection.OUTBOUND
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {engagement.direction === EngagementDirection.OUTBOUND
                            ? "Outbound"
                            : "Inbound"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(engagement.engagedAt), "PPp")}
                      </span>
                    </div>

                    {engagement.subject && (
                      <h4 className="font-medium text-sm mb-1">{engagement.subject}</h4>
                    )}

                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {engagement.message}
                    </p>

                    {engagement.userName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        By: {engagement.userName}
                      </p>
                    )}
                  </div>
                </div>
                {index < engagements.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
