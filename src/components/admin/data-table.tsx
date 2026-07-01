// src/components/admin/data-table.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  pageSize?: number;
  actions?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  actions,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter((item) => {
      const val = item[searchKey];
      if (typeof val === "string") {
        return val.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [data, search, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        {searchKey && (
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-[12px] bg-muted/30 border-border/60 rounded-xl"
            />
          </div>
        )}
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn("text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground h-10 px-4", col.className)}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-[12px] text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("text-[12px] px-4 py-3", col.className)}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-[11px] font-medium text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              <ChevronRight size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
