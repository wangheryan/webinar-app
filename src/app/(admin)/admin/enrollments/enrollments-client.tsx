"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, CheckCircle2, XCircle, Trash2 } from "lucide-react";

import { AdminEnrollment, updateEnrollmentStatus, deleteEnrollment } from "./actions";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderStatus } from "@/generated/prisma/client";

export function EnrollmentsClient({ enrollments }: { enrollments: AdminEnrollment[] }) {

  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ enrollment: AdminEnrollment | null; open: boolean }>({ enrollment: null, open: false });

  const handleUpdateStatus = (id: string, status: "SUCCESS" | "CANCELLED") => {
    startTransition(async () => {
      try {
        await updateEnrollmentStatus(id, status);
        toast.success("Berhasil memperbarui status transaksi");
      } catch {
        toast.error("Gagal memperbarui status");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.enrollment) return;
    startTransition(async () => {
      try {
        await deleteEnrollment(deleteDialog.enrollment!.id);
        toast.success("Berhasil menghapus transaksi");
        setDeleteDialog({ enrollment: null, open: false });
      } catch {
        toast.error("Gagal menghapus transaksi");
      }
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SUCCESS": return "success";
      case "PENDING": return "warning";
      case "CANCELLED":
      case "EXPIRED": return "error";
      default: return "neutral";
    }
  };

  const columns: Column<AdminEnrollment>[] = [
    {
      key: "transaction",
      label: "colTransaction",
      render: (e) => (
        <div className="min-w-[200px]">
          <p className="text-[12px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground line-clamp-1">{e.webinar.title}</p>
          <p className="text-[11px] font-medium text-muted-foreground">{e.user.name || e.user.email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "colAmount",
      render: (e) => (
        <div className="flex flex-col">
          <span className="text-[12px] font-extrabold text-foreground">{formatCurrency(e.totalAmount)}</span>
          {(e.discountAmount > 0 || e.addonAmount > 0) && (
            <span className="text-[10px] font-medium flex gap-1 items-center mt-0.5">
              {e.discountAmount > 0 && <span className="text-emerald-500 bg-emerald-500/10 px-1 rounded">-{formatCurrency(e.discountAmount)}</span>}
              {e.addonAmount > 0 && <span className="text-indigo-500 bg-indigo-500/10 px-1 rounded">+{formatCurrency(e.addonAmount)}</span>}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "method",
      label: "colMethod",
      render: (e) => (
        <span className="text-[11.5px] font-medium text-muted-foreground uppercase">
          {e.paymentChannel || e.xenditChannelCode || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "colStatus",
      render: (e) => {
        let label: string = e.status;
        if (e.status === "PENDING") label = "Pending";
        if (e.status === "SUCCESS") label = "Success";
        if (e.status === "CANCELLED") label = "Cancelled";
        if (e.status === "EXPIRED") label = "Expired";

        return <StatusBadge label={label} variant={getStatusVariant(e.status)} />;
      },
    },
    {
      key: "date",
      label: "colDate",
      render: (e) => (
        <span className="text-[11px] text-muted-foreground">
          {new Date(e.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "colActions",
      className: "text-right",
      render: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel className="text-[11px] font-semibold  uppercase text-muted-foreground">
              {"Aksi"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {e.status === "PENDING" && (
              <>
                <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleUpdateStatus(e.id, "SUCCESS")}>
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" /> Tandai Success
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleUpdateStatus(e.id, "CANCELLED")}>
                  <XCircle className="mr-2 h-3.5 w-3.5 text-rose-500" /> Tandai Cancelled
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              className="text-[12px] text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50 cursor-pointer"
              onClick={() => setDeleteDialog({ enrollment: e, open: true })}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Transaksi</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Kelola {enrollments.length} transaksi</p>
      </div>

      <DataTable
        data={enrollments.map(e => ({ ...e, searchEmail: e.user.email || "" }))}
        columns={columns}
        searchKey="searchEmail"
        searchPlaceholder="Cari email..."
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Transaksi</DialogTitle>
            <DialogDescription className="text-[12px]">
              Anda yakin ingin menghapus transaksi <strong>{deleteDialog.enrollment?.user?.email || ""}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ enrollment: null, open: false })} className="text-[12px]">
              {"Batal"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="text-[12px]">
              {isPending ? "btnDeleting" : "btnDelete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
