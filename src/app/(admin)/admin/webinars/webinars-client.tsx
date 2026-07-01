// src/app/(admin)/admin/webinars/webinars-client.tsx
"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Radio, CheckCircle2, Trash2, Edit, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { getAccessTypeBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  toggleWebinarLive, toggleWebinarCompleted, deleteWebinar,
  createWebinar, updateWebinar, type AdminWebinar,
} from "./actions";




export function WebinarsClient({ webinars }: { webinars: AdminWebinar[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ webinar: AdminWebinar | null; open: boolean }>({ webinar: null, open: false });


  const handleToggleLive = useCallback((webinar: AdminWebinar) => {
    startTransition(async () => {
      try {
        const r = await toggleWebinarLive(webinar.id);
        toast.success(r.isLive ? "liveSuccess" : "offlineSuccess");
      } catch { toast.error("liveError"); }
    });
  }, []);

  const handleToggleCompleted = useCallback((webinar: AdminWebinar) => {
    startTransition(async () => {
      try {
        const r = await toggleWebinarCompleted(webinar.id);
        toast.success(r.isCompleted ? "completedSuccess" : "completedUndo");
      } catch { toast.error("completedError"); }
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteDialog.webinar) return;
    startTransition(async () => {
      try {
        await deleteWebinar(deleteDialog.webinar!.id);
        toast.success("deleteSuccess");
        setDeleteDialog({ webinar: null, open: false });
      } catch { toast.error("deleteError"); }
    });
  }, [deleteDialog]);

  const columns = useMemo<Column<AdminWebinar>[]>(() => [
    {
      key: "title",
      label: "colWebinar",
      render: (w) => (
        <div className="min-w-[200px]">
          <p className="text-[12px] font-semibold  text-foreground line-clamp-1">{w.title}</p>
          <p className="text-[10.5px] text-muted-foreground">/{w.slug}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "colCategory",
      render: (w) => <span className="text-[11px] font-medium text-muted-foreground">{w.category}</span>,
    },
    {
      key: "price",
      label: "colPrice",
      render: (w) => <span className="text-[12px] font-semibold  text-foreground">{formatCurrency(w.basePrice)}</span>,
    },
    {
      key: "accessType",
      label: "colAccess",
      render: (w) => {
        const badge = getAccessTypeBadge(w.accessType);
        return <StatusBadge label={badge.label} variant={badge.variant} />;
      },
    },
    {
      key: "status",
      label: "colStatus",
      render: (w) => (
        <div className="flex items-center gap-1.5">
          {w.isLive && <StatusBadge label={"Siaran Berlangsung"} variant="success" />}
          {w.isCompleted && <StatusBadge label={"Selesai"} variant="neutral" />}
          {!w.isLive && !w.isCompleted && <StatusBadge label={"Draf"} variant="warning" />}
        </div>
      ),
    },
    {
      key: "participants",
      label: "colParticipants",
      className: "text-center",
      render: (w) => <span className="text-[12px] font-semibold ">{w._count?.participants || 0}</span>,
    },
    {
      key: "actions",
      label: "colActions",
      className: "text-right",
      render: (w) => (
        <div className="flex items-center gap-1 justify-end">
          <Link href={`/admin/webinars/${w.id}/participants`}>
            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" title="Participants">
              <Users size={14} className="text-muted-foreground hover:text-indigo-500" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" title="Edit" onClick={() => router.push(`/admin/webinars/${w.id}/edit`)}>
            <Edit size={14} className="text-muted-foreground hover:text-primary" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" title={w.isLive ? "Take Offline" : "Go Live"}
            onClick={() => handleToggleLive(w)} disabled={isPending}
          >
            <Radio size={14} className={w.isLive ? "text-emerald-500" : "text-muted-foreground"} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" title={w.isCompleted ? "Unmark Completed" : "Mark Completed"}
            onClick={() => handleToggleCompleted(w)} disabled={isPending}
          >
            <CheckCircle2 size={14} className={w.isCompleted ? "text-sky-500" : "text-muted-foreground"} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-500 cursor-pointer"
            title="Delete" onClick={() => setDeleteDialog({ webinar: w, open: true })}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ], [isPending, handleToggleLive, handleToggleCompleted]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Manajemen Webinar</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Kelola {webinars.length} webinar platform</p>
      </div>

      <DataTable
        data={webinars}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Cari webinar..."
        actions={
          <Button
            className="h-9 gap-2 text-[12px] font-semibold  rounded-xl cursor-pointer"
            onClick={() => router.push("/admin/webinars/create")}
          >
            <Plus size={14} /> Buat Webinar
          </Button>
        }
      />



      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Webinar</DialogTitle>
            <DialogDescription className="text-[12px]">
              Apakah Anda yakin ingin menghapus webinar <strong>{deleteDialog.webinar?.title || ""}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ webinar: null, open: false })} className="text-[12px]">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="text-[12px]">
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
