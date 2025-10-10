"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LayoutGrid, List } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderCard?: (item: TData) => React.ReactNode;
  initialView?: "table" | "card";
  toolbar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderCard,
  initialView = "table",
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [view, setView] = React.useState<"table" | "card">(initialView);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasRows = table.getRowModel().rows?.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex-1 min-w-0">{toolbar}</div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={view === "table" ? "default" : "outline"}
            onClick={() => setView("table")}
          >
            <List className="mr-2" /> Table
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "card" ? "default" : "outline"}
            onClick={() => setView("card")}
          >
            <LayoutGrid className="mr-2" /> Cards
          </Button>
        </div>
      </div>

      {view === "table" ? (
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
                            header.getContext()
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
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                            cell.getContext()
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
        <div className="p-6 text-center text-sm text-muted-foreground">No results.</div>
      )}
    </div>
  );
}
