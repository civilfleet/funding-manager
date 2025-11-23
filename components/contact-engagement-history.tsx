"use client";

import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import ContactEngagementForm from "@/components/forms/contact-engagement";
import { Loader } from "@/components/helper/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator as UiSeparator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  type ContactEngagement,
  EngagementDirection,
  EngagementSource,
  TodoStatus,
} from "@/types";

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
    case EngagementSource.TODO:
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getSourceLabel = (
  source: EngagementSource,
  externalSource?: string,
) => {
  switch (source) {
    case EngagementSource.EMAIL:
      return externalSource ? `Email - ${externalSource}` : "Email";
    case EngagementSource.PHONE:
      return "Phone";
    case EngagementSource.SMS:
      return "SMS";
    case EngagementSource.MEETING:
      return "Meeting";
    case EngagementSource.EVENT:
      return "Event";
    case EngagementSource.TODO:
      return "Todo";
    case EngagementSource.OTHER:
      return "Other";
    default:
      return source;
  }
};

const getTodoStatusColor = (status?: TodoStatus) => {
  switch (status) {
    case TodoStatus.PENDING:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case TodoStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case TodoStatus.COMPLETED:
      return "bg-green-100 text-green-800 border-green-200";
    case TodoStatus.CANCELLED:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTodoStatusLabel = (status?: TodoStatus) => {
  switch (status) {
    case TodoStatus.PENDING:
      return "Pending";
    case TodoStatus.IN_PROGRESS:
      return "In Progress";
    case TodoStatus.COMPLETED:
      return "Completed";
    case TodoStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
};

const getTodoStatusIcon = (status?: TodoStatus) => {
  switch (status) {
    case TodoStatus.COMPLETED:
      return CheckCircle2;
    case TodoStatus.IN_PROGRESS:
      return Clock;
    default:
      return Circle;
  }
};

type ParsedEngagementContent = {
  body: string;
  details: Array<{ label: string; value: string }>;
  additional: Array<{ label: string; value: string }>;
};

const parseEngagementContent = (message?: string): ParsedEngagementContent => {
  if (!message) {
    return { body: "", details: [], additional: [] };
  }

  const [firstBlock, ...rest] = message.split(/\n\s*\n/);
  const body = (firstBlock ?? "").trim();
  const detailsBlock = rest.join("\n\n").trim();

  const details: Array<{ label: string; value: string }> = [];
  const additional: Array<{ label: string; value: string }> = [];

  if (detailsBlock) {
    detailsBlock.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const [rawLabel, ...rawValue] = trimmed.split(":");
      const label = rawLabel.trim();
      const value = rawValue.join(":").trim();
      if (!label) return;
      if (label.startsWith("Additional - ")) {
        additional.push({
          label: label.replace("Additional - ", ""),
          value: value || "-",
        });
        return;
      }
      details.push({ label, value: value || "-" });
    });
  }

  return { body, details, additional };
};

export default function ContactEngagementHistory({
  contactId,
  teamId,
}: ContactEngagementHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/contact-engagements?contactId=${contactId}&teamId=${teamId}`,
    fetcher,
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
            <CardTitle className="text-xl font-semibold">
              Engagement History
            </CardTitle>
            <CardDescription>
              Track all interactions with this contact
            </CardDescription>
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
            <p className="text-sm text-muted-foreground">
              No engagements recorded yet
            </p>
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
                    {engagement.source === EngagementSource.TODO ? (
                      <div
                          className={`rounded-full p-2 ${
                            engagement.todoStatus === TodoStatus.COMPLETED
                              ? "bg-green-100"
                              : engagement.todoStatus === TodoStatus.IN_PROGRESS
                                ? "bg-blue-100"
                                : "bg-amber-100"
                          }`}
                        >
                          {(() => {
                            const Icon = getTodoStatusIcon(
                              engagement.todoStatus,
                            );
                            return (
                              <Icon
                                className={`h-4 w-4 ${
                                  engagement.todoStatus === TodoStatus.COMPLETED
                                    ? "text-green-600"
                                    : engagement.todoStatus ===
                                        TodoStatus.IN_PROGRESS
                                      ? "text-blue-600"
                                      : "text-amber-600"
                                }`}
                              />
                            );
                          })()}
                        </div>
                    ) : (
                      <div
                        className={`rounded-full p-2 ${
                          engagement.direction === EngagementDirection.OUTBOUND
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {engagement.direction ===
                        EngagementDirection.OUTBOUND ? (
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    )}
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
                          {getSourceLabel(engagement.source, engagement.externalSource)}
                        </Badge>
                        {engagement.source === EngagementSource.TODO &&
                          engagement.todoStatus && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${getTodoStatusColor(engagement.todoStatus)}`}
                            >
                              {getTodoStatusLabel(engagement.todoStatus)}
                            </Badge>
                          )}
                        {engagement.source !== EngagementSource.TODO && (
                          <Badge
                            variant={
                              engagement.direction ===
                              EngagementDirection.OUTBOUND
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {engagement.direction ===
                            EngagementDirection.OUTBOUND
                              ? "Outbound"
                              : "Inbound"}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(engagement.engagedAt), "PPp")}
                      </span>
                    </div>

                    {(() => {
                      const parsed = parseEngagementContent(engagement.message);
                      const metric =
                        parsed.details.find(
                          (d) => d.label.toLowerCase() === "metric",
                        )?.value ?? undefined;
                      return (
                        <div className="space-y-3">
                          <div className="rounded-lg border shadow-sm bg-white">
                            <div className="px-4 py-3 space-y-1">
                              <h4 className="text-sm font-semibold">
                                Subject: {engagement.subject || "Email"}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                To: {parsed.details.find((d) => d.label.toLowerCase().includes("recipient"))?.value || "Unknown"}
                              </p>
                              {metric && (
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Event
                                  </span>
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 border border-blue-100">
                                    {metric}
                                  </span>
                                </div>
                              )}
                            </div>

                            <UiSeparator />

                            {parsed.body && (
                              <div className="bg-muted/40 px-4 py-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                  Message
                                </p>
                                <div className="rounded-md border bg-background px-3 py-3">
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {parsed.body}
                                  </p>
                                </div>
                              </div>
                            )}

                            {(() => {
                              const combinedAdditional = [
                                ...parsed.details.filter(
                                  (d) =>
                                    !d.label.toLowerCase().includes("recipient") &&
                                    d.label.toLowerCase() !== "subject",
                                ),
                                ...parsed.additional,
                              ];
                              if (combinedAdditional.length === 0) return null;
                              return (
                                <>
                                  <UiSeparator />
                                  <div className="px-4 py-3 space-y-3">
                                    <Collapsible>
                                      <CollapsibleTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 px-3">
                                          Show details
                                        </Button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="mt-2 rounded-md border bg-muted/20 px-3 py-2 space-y-2">
                                        {combinedAdditional.map((item) => (
                                          <div key={`${engagement.id}-add-${item.label}`}>
                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                              {item.label}
                                            </p>
                                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                              {item.value}
                                            </p>
                                          </div>
                                        ))}
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()}

                    {engagement.source === EngagementSource.TODO && (
                      <div className="mt-2 flex flex-col gap-1">
                        {engagement.assignedToUserName && (
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {engagement.assignedToUserName}
                          </p>
                        )}
                        {engagement.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(engagement.dueDate), "PPp")}
                          </p>
                        )}
                      </div>
                    )}

                    {engagement.userName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {engagement.source === EngagementSource.TODO
                          ? "Created by"
                          : "By"}
                        : {engagement.userName}
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
