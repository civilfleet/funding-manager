"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { LayoutGrid, List, Map } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderCard?: (item: TData) => React.ReactNode;
  renderMap?: (items: TData[]) => React.ReactNode;
  initialView?: "table" | "card" | "map";
  toolbar?: React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  renderBatchActions?: (params: {
    selectedRows: TData[];
    clearSelection: () => void;
  }) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderCard,
  renderMap,
  initialView = "table",
  toolbar,
  selectable = false,
  onSelectionChange,
  renderBatchActions,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
  const resolvedInitialView =
    !renderMap && initialView === "map" ? "table" : initialView;
  const [view, setView] = React.useState<"table" | "card" | "map">(
    isMobile ? "card" : resolvedInitialView,
  );
  const [desktopView, setDesktopView] = React.useState<"table" | "card" | "map">(
    resolvedInitialView,
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const selectionColumn = React.useMemo<ColumnDef<TData, TValue>[]>(
    () =>
      selectable
        ? [
            {
              id: "__select",
              size: 40,
              enableSorting: false,
              enableHiding: false,
              header: ({ table }) => (
                <Checkbox
                  aria-label="Select all"
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(Boolean(value))
                  }
                  className="translate-y-0.5"
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label="Select row"
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  onCheckedChange={(value) =>
                    row.toggleSelected(Boolean(value))
                  }
                  className="translate-y-0.5"
                />
              ),
            } satisfies ColumnDef<TData>,
          ].map((column) => column as ColumnDef<TData, TValue>)
        : [],
    [selectable],
  );

  const enhancedColumns = React.useMemo(
    () => [...selectionColumn, ...columns],
    [selectionColumn, columns],
  );

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting,
    },
  });

  const hasRows = table.getRowModel().rows?.length > 0;
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original as TData);

  const clearSelection = React.useCallback(() => {
    setRowSelection({});
  }, []);

  React.useEffect(() => {
    if (selectable && onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectable, selectedRows, onSelectionChange]);

  React.useEffect(() => {
    if (isMobile) {
      setView("card");
      return;
    }
    setView(desktopView);
  }, [isMobile, desktopView]);

  const effectiveView = isMobile ? "card" : view;
  const showMapToggle = Boolean(renderMap);
  const hasBatchActions = selectable && Boolean(renderBatchActions);
  const showBatchActions = hasBatchActions && selectedRows.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex-1 min-w-0">{toolbar}</div>
        {!isMobile && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={effectiveView === "table" ? "default" : "outline"}
              onClick={() => {
                setView("table");
                setDesktopView("table");
              }}
            >
              <List className="mr-2" /> Table
            </Button>
            <Button
              type="button"
              size="sm"
              variant={effectiveView === "card" ? "default" : "outline"}
              onClick={() => {
                setView("card");
                setDesktopView("card");
              }}
            >
              <LayoutGrid className="mr-2" /> Cards
            </Button>
            {showMapToggle && (
              <Button
                type="button"
                size="sm"
                variant={effectiveView === "map" ? "default" : "outline"}
                onClick={() => {
                  setView("map");
                  setDesktopView("map");
                }}
              >
                <Map className="mr-2" /> Map
              </Button>
            )}
          </div>
        )}
      </div>
      {hasBatchActions && (
        <div
          className={cn(
            "min-h-11 px-3 pb-2 transition-opacity",
            showBatchActions ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!showBatchActions}
        >
          {showBatchActions ? (
            <div className="flex items-center justify-between gap-3">
              {renderBatchActions?.({ selectedRows, clearSelection })}
            </div>
          ) : null}
        </div>
      )}

      {effectiveView === "table" ? (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {hasRows ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : effectiveView === "map" ? (
        <div className="p-3">
          {renderMap ? (
            renderMap(data)
          ) : (
            <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
              Map view is unavailable.
            </div>
          )}
        </div>
      ) : hasRows ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
          {table.getRowModel().rows.map((row) => (
            <div key={row.id}>
              {renderCard ? (
                renderCard(row.original as TData)
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="text-sm">
                        <div className="text-xs text-muted-foreground">
                          {cell.column.id}
                        </div>
                        <div className="font-medium">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No results.
        </div>
      )}
    </div>
  );
}
