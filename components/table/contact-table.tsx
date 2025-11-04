"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { DataTable } from "@/components/data-table";
import ButtonControl from "@/components/helper/button-control";
import FormInputControl from "@/components/helper/form-input-control";
import { Loader } from "@/components/helper/loader";
import {
  type ContactRow,
  contactColumns,
  renderContactCard,
} from "@/components/table/contact-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ContactFilter, ContactFilterType } from "@/types";

interface ContactTableProps {
  teamId: string;
}

type FilterOption = {
  type: ContactFilterType;
  label: string;
  allowMultiple?: boolean;
  field?: "email" | "phone";
};

const FILTER_OPTIONS: FilterOption[] = [
  {
    type: "contactField",
    field: "email",
    label: "Email",
    allowMultiple: true,
  },
  {
    type: "contactField",
    field: "phone",
    label: "Phone",
    allowMultiple: true,
  },
  { type: "attribute", label: "Attribute", allowMultiple: true },
  { type: "group", label: "Group", allowMultiple: true },
  { type: "eventRole", label: "Event role", allowMultiple: true },
  { type: "createdAt", label: "Created date", allowMultiple: false },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const querySchema = z.object({
  query: z.string(),
});

const isFilterComplete = (filter: ContactFilter) => {
  switch (filter.type) {
    case "contactField":
      if (filter.operator === "contains") {
        return Boolean(filter.value?.trim());
      }
      return true;
    case "attribute":
      if (!filter.key?.trim()) {
        return false;
      }
      return Boolean(filter.value?.trim());
    case "group":
      return Boolean(filter.groupId);
    case "eventRole":
      return Boolean(filter.eventRoleId);
    case "createdAt":
      return Boolean(filter.from) || Boolean(filter.to);
    default:
      return true;
  }
};

export default function ContactTable({ teamId }: ContactTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<ContactFilter[]>([]);

  const form = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: { query: "" },
  });

  const query = form.watch("query");

  const activeFilters = useMemo(
    () => filters.filter(isFilterComplete),
    [filters],
  );

  const filtersQuery = useMemo(() => {
    if (!activeFilters.length) {
      return "";
    }

    return `&filters=${encodeURIComponent(JSON.stringify(activeFilters))}`;
  }, [activeFilters]);

  const contactsKey = `/api/contacts?teamId=${teamId}&query=${encodeURIComponent(query)}${filtersQuery}`;

  const { data, error, isLoading, mutate } = useSWR(contactsKey, fetcher);

  const { data: rolesData } = useSWR(
    `/api/event-roles?teamId=${teamId}`,
    fetcher,
  );

  const { data: groupsData } = useSWR(
    `/api/groups?teamId=${teamId}`,
    fetcher,
  );

  const eventRoles = useMemo(() => {
    if (!rolesData?.data) {
      return [] as Array<{ id: string; name: string; color?: string }>;
    }

    return rolesData.data as Array<{ id: string; name: string; color?: string }>;
  }, [rolesData]);

  const groups = useMemo(() => {
    if (!groupsData?.data) {
      return [] as Array<{ id: string; name: string }>;
    }

    return groupsData.data as Array<{ id: string; name: string }>;
  }, [groupsData]);

  const groupMap = useMemo(() => {
    return new Map(groups.map((group) => [group.id, group]));
  }, [groups]);

  const eventRoleMap = useMemo(() => {
    return new Map(eventRoles.map((role) => [role.id, role]));
  }, [eventRoles]);

  const renderCard = (contact: ContactRow) =>
    renderContactCard(contact, teamId);

  const contacts = useMemo<ContactRow[]>(() => {
    if (!data?.data) {
      return [];
    }

    return data.data as ContactRow[];
  }, [data]);

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    contacts.forEach((contact) => {
      contact.profileAttributes?.forEach((attribute) => {
        if (attribute?.key) {
          keys.add(attribute.key);
        }
      });
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  useEffect(() => {
    if (!attributeKeys.length) {
      return;
    }

    setFilters((previous) => {
      let changed = false;
      const updated = previous.map((filter) => {
        if (
          filter.type === "attribute" &&
          !attributeKeys.includes(filter.key)
        ) {
          changed = true;
          return { ...filter, key: attributeKeys[0] };
        }
        return filter;
      });

      return changed ? updated : previous;
    });
  }, [attributeKeys]);

  if (error) {
    toast({
      title: "Unable to load contacts",
      description: "An unexpected error occurred while fetching contacts.",
      variant: "destructive",
    });
  }

  const handleSubmit = (values: z.infer<typeof querySchema>) => {
    form.setValue("query", values.query);
  };

  const handleDeleteSelected = async (
    selectedRows: ContactRow[],
    clearSelection: () => void,
  ) => {
    if (selectedRows.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          ids: selectedRows.map((contact) => contact.id),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to delete contacts");
      }

      toast({
        title: "Contacts deleted",
        description: `${selectedRows.length} contact${
          selectedRows.length > 1 ? "s" : ""
        } removed successfully.`,
      });

      clearSelection();
      await mutate();
    } catch (deleteError) {
      toast({
        title: "Unable to delete contacts",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const updateFilter = useCallback(
    (index: number, updater: (current: ContactFilter) => ContactFilter) => {
      setFilters((previous) =>
        previous.map((filter, idx) =>
          idx === index ? updater(filter) : filter,
        ),
      );
    },
    [],
  );

  const createDefaultFilter = useCallback(
    (option: FilterOption): ContactFilter => {
      switch (option.type) {
        case "contactField":
          return {
            type: "contactField",
            field: option.field ?? "email",
            operator: "has",
          };
        case "attribute":
          if (!attributeKeys.length) {
            return {
              type: "attribute",
              key: "",
              operator: "contains",
              value: "",
            };
          }
          return {
            type: "attribute",
            key: attributeKeys[0],
            operator: "contains",
            value: "",
          };
        case "group":
          return {
            type: "group",
            groupId: groups[0]?.id ?? "",
          };
        case "eventRole":
          return {
            type: "eventRole",
            eventRoleId: eventRoles[0]?.id ?? "",
          };
        case "createdAt":
          return { type: "createdAt" };
        default:
          return {
            type: "contactField",
            field: "email",
            operator: "has",
          };
      }
    },
    [attributeKeys, eventRoles, groups],
  );

  const handleAddFilter = (option: FilterOption) => {
    if (option.type === "attribute" && attributeKeys.length === 0) {
      return;
    }

    const alreadyExists = filters.some((filter) => {
      if (filter.type !== option.type) {
        return false;
      }

      if (option.type === "contactField") {
        return filter.type === "contactField" && filter.field === option.field;
      }

      return true;
    });

    if (alreadyExists && !option.allowMultiple) {
      return;
    }

    setFilters((previous) => [...previous, createDefaultFilter(option)]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters((previous) => previous.filter((_, idx) => idx !== index));
  };

  const summarizeFilter = useCallback(
    (filter: ContactFilter) => {
      switch (filter.type) {
        case "contactField": {
          const label = filter.field === "email" ? "Email" : "Phone";
          if (filter.operator === "contains") {
            return filter.value
              ? `${label} contains “${filter.value}”`
              : `${label} contains…`;
          }
          if (filter.operator === "has") {
            return `${label} present`;
          }
          return `${label} missing`;
        }
        case "attribute": {
          const keyLabel = filter.key || "Attribute";
          const operatorLabel =
            filter.operator === "equals" ? "equals" : "contains";
          const trimmedValue = (filter.value ?? "").trim();
          return trimmedValue
            ? `${keyLabel} ${operatorLabel} “${trimmedValue}”`
            : `${keyLabel} ${operatorLabel}…`;
        }
        case "group": {
          const groupName = filter.groupId
            ? groupMap.get(filter.groupId)?.name
            : undefined;
          return groupName ? `Group: ${groupName}` : "Group: Select…";
        }
        case "eventRole": {
          const roleName = filter.eventRoleId
            ? eventRoleMap.get(filter.eventRoleId)?.name
            : undefined;
          return roleName ? `Role: ${roleName}` : "Role: Select…";
        }
        case "createdAt": {
          if (filter.from && filter.to) {
            return `Created between ${filter.from} and ${filter.to}`;
          }
          if (filter.from) {
            return `Created after ${filter.from}`;
          }
          if (filter.to) {
            return `Created before ${filter.to}`;
          }
          return "Created date";
        }
        default:
          return "Filter";
      }
    },
    [eventRoleMap, groupMap],
  );

  const isOptionDisabled = (option: FilterOption) => {
    const alreadyExists = filters.some((filter) => {
      if (filter.type !== option.type) {
        return false;
      }

      if (option.type === "contactField") {
        return filter.type === "contactField" && filter.field === option.field;
      }

      return true;
    });

    if (alreadyExists && !option.allowMultiple) {
      return true;
    }

    if (option.type === "attribute" && attributeKeys.length === 0) {
      return true;
    }

    if (option.type === "group" && groups.length === 0) {
      return true;
    }

    if (option.type === "eventRole" && eventRoles.length === 0) {
      return true;
    }

    return false;
  };

  const renderFilterControl = (filter: ContactFilter, index: number) => {
    switch (filter.type) {
      case "contactField":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filter.operator}
              onValueChange={(value) =>
                updateFilter(index, (current) =>
                  current.type === "contactField"
                    ? {
                        ...current,
                        operator: value as "has" | "missing" | "contains",
                        value:
                          value === "contains"
                            ? current.value ?? ""
                            : undefined,
                      }
                    : current,
                )
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="has">Has value</SelectItem>
                <SelectItem value="missing">Is missing</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
              </SelectContent>
            </Select>
            {filter.operator === "contains" && (
              <Input
                type="text"
                placeholder="Contains…"
                value={filter.value ?? ""}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  updateFilter(index, (current) =>
                    current.type === "contactField"
                      ? { ...current, value: nextValue }
                      : current,
                  );
                }}
                className="w-56"
              />
            )}
          </div>
        );
      case "attribute": {
        if (attributeKeys.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">
              No attributes available
            </span>
          );
        }

        const selectedKey = attributeKeys.includes(filter.key)
          ? filter.key
          : attributeKeys[0] ?? "";

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedKey}
              onValueChange={(value) =>
                updateFilter(index, (current) =>
                  current.type === "attribute"
                    ? { ...current, key: value }
                    : current,
                )
              }
              disabled={attributeKeys.length === 0}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {attributeKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.operator}
              onValueChange={(value) =>
                updateFilter(index, (current) =>
                  current.type === "attribute"
                    ? {
                        ...current,
                        operator: value as "contains" | "equals",
                      }
                    : current,
                )
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Value"
              value={filter.value}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                updateFilter(index, (current) =>
                  current.type === "attribute"
                    ? { ...current, value: nextValue }
                    : current,
                );
              }}
              className="w-56"
            />
          </div>
        );
      }
      case "group":
        return (
          <Select
            value={filter.groupId ?? ""}
            onValueChange={(value) =>
              updateFilter(index, (current) =>
                current.type === "group" ? { ...current, groupId: value } : current,
              )
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "eventRole":
        return (
          <Select
            value={filter.eventRoleId ?? ""}
            onValueChange={(value) =>
              updateFilter(index, (current) =>
                current.type === "eventRole"
                  ? { ...current, eventRoleId: value }
                  : current,
              )
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {eventRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "createdAt":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">From</span>
              <Input
                type="date"
                value={filter.from ?? ""}
                onChange={(event) =>
                  updateFilter(index, (current) =>
                    current.type === "createdAt"
                      ? { ...current, from: event.currentTarget.value || undefined }
                      : current,
                  )
                }
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">To</span>
              <Input
                type="date"
                value={filter.to ?? ""}
                onChange={(event) =>
                  updateFilter(index, (current) =>
                    current.type === "createdAt"
                      ? { ...current, to: event.currentTarget.value || undefined }
                      : current,
                  )
                }
                className="w-40"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-4 flex flex-col gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
        >
          <FormInputControl
            form={form}
            name="query"
            placeholder="Search contacts"
          />
          <ButtonControl type="submit" label="Search" className="sm:ml-2" />
        </form>
      </Form>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <Filter className="h-4 w-4" />
              Add filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FILTER_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={`${option.type}-${option.field ?? "default"}`}
                disabled={isOptionDisabled(option)}
                onSelect={(event) => {
                  event.preventDefault();
                  handleAddFilter(option);
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filters.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFilters([])}
          >
            Clear filters
          </Button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-col gap-2">
          {filters.map((filter, index) => {
            const option = FILTER_OPTIONS.find(
              (item) =>
                item.type === filter.type &&
                (filter.type !== "contactField" ||
                  item.field === filter.field),
            );
            return (
              <div
                key={`${filter.type}-${index}`}
                className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3"
              >
                <span className="text-sm font-medium">
                  {option?.label ?? "Filter"}
                </span>
                {renderFilterControl(filter, index)}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={`active-${filter.type}-${index}`} variant="secondary">
              {summarizeFilter(filter)}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-md border p-2">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={contactColumns}
            data={contacts}
            renderCard={renderCard}
            initialView="table"
            selectable
            renderBatchActions={({ selectedRows, clearSelection }) => (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() =>
                      handleDeleteSelected(selectedRows, clearSelection)
                    }
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      "Delete selected"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting || selectedRows.length === 0}
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
