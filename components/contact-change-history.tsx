"use client";

import useSWR from "swr";
import { format } from "date-fns";
import { History, Plus, Edit, Trash } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/helper/loader";
import { ContactChangeLog, ChangeAction } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContactChangeHistoryProps {
  contactId: string;
}

const getActionIcon = (action: ChangeAction) => {
  switch (action) {
    case ChangeAction.CREATED:
      return Plus;
    case ChangeAction.UPDATED:
      return Edit;
    case ChangeAction.DELETED:
      return Trash;
    default:
      return History;
  }
};

const getActionColor = (action: ChangeAction) => {
  switch (action) {
    case ChangeAction.CREATED:
      return "bg-green-100 text-green-800 border-green-200";
    case ChangeAction.UPDATED:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case ChangeAction.DELETED:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getActionLabel = (action: ChangeAction) => {
  switch (action) {
    case ChangeAction.CREATED:
      return "Created";
    case ChangeAction.UPDATED:
      return "Updated";
    case ChangeAction.DELETED:
      return "Deleted";
    default:
      return action;
  }
};

const formatFieldName = (fieldName?: string) => {
  if (!fieldName) return "";
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value?: string) => {
  if (!value) return "—";
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object") {
      return JSON.stringify(parsed, null, 2);
    }
    return String(parsed);
  } catch {
    return value;
  }
};

export default function ContactChangeHistory({ contactId }: ContactChangeHistoryProps) {
  const { data, error, isLoading } = useSWR(
    `/api/contact-change-logs?contactId=${contactId}`,
    fetcher
  );

  const logs = (data?.data || []) as ContactChangeLog[];

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-xl font-semibold">Change History</CardTitle>
            <CardDescription>Track all modifications made to this contact</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Failed to load change history
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 rounded-md border border-dashed">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No changes recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <div key={log.id}>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-2 ${getActionColor(log.action)}`}>
                        <ActionIcon className="h-4 w-4" />
                      </div>
                      {index < logs.length - 1 && (
                        <div className="w-px h-full bg-border mt-2" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActionColor(log.action)}`}
                          >
                            {getActionLabel(log.action)}
                          </Badge>
                          {log.fieldName && (
                            <span className="text-sm font-medium">
                              {formatFieldName(log.fieldName)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.createdAt), "PPp")}
                        </span>
                      </div>

                      {log.action === ChangeAction.CREATED && (
                        <p className="text-sm text-muted-foreground">
                          Contact record was created
                        </p>
                      )}

                      {log.action === ChangeAction.UPDATED && log.fieldName && (
                        <div className="space-y-1 text-sm">
                          {log.oldValue && (
                            <div className="p-2 rounded bg-red-50 border border-red-200">
                              <span className="text-xs font-medium text-red-800">Old:</span>
                              <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">
                                {formatValue(log.oldValue)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="p-2 rounded bg-green-50 border border-green-200">
                              <span className="text-xs font-medium text-green-800">New:</span>
                              <pre className="text-xs text-green-700 mt-1 whitespace-pre-wrap">
                                {formatValue(log.newValue)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {log.action === ChangeAction.DELETED && (
                        <p className="text-sm text-muted-foreground">
                          {log.fieldName
                            ? `${formatFieldName(log.fieldName)} was removed`
                            : "Contact record was deleted"}
                        </p>
                      )}

                      {log.userName && (
                        <p className="text-xs text-muted-foreground mt-2">
                          By: {log.userName}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
