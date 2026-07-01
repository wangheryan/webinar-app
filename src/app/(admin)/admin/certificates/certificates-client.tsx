"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Trash2, Power, PowerOff, Plus } from "lucide-react";

import { toggleCertificateStatus, deleteCertificate } from "@/actions/certificate";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CertificateForm } from "./certificate-form";

export type AdminCertificate = {
  id: string;
  certificateNumber: string;
  userId: string;
  webinarId: string;
  isValid: boolean;
  issueDate: Date;
  user: { name: string | null; email: string | null };
  webinar: { title: string; slug: string };
};

export function CertificatesClient({ certificates }: { certificates: AdminCertificate[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ cert: AdminCertificate | null; open: boolean }>({ cert: null, open: false });
  const [formDialog, setFormDialog] = useState(false);

  const handleToggleStatus = (cert: AdminCertificate) => {
    startTransition(async () => {
      try {
        const res = await toggleCertificateStatus(cert.id);
        if (res.success) toast.success("Status sertifikat berhasil diubah.");
        else toast.error(res.error || "Gagal mengubah status.");
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.cert) return;
    startTransition(async () => {
      try {
        const res = await deleteCertificate(deleteDialog.cert!.id);
        if (res.success) toast.success("Sertifikat berhasil dihapus.");
        else toast.error(res.error || "Gagal menghapus sertifikat.");
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      } finally {
        setDeleteDialog({ cert: null, open: false });
      }
    });
  };

  const columns: Column<AdminCertificate>[] = [
    {
      key: "certificateNumber",
      label: "Nomor Sertifikat",
      render: (c) => (
        <span className="text-[12px] font-mono font-bold text-primary">{c.certificateNumber}</span>
      ),
    },
    {
      key: "user",
      label: "Penerima",
      render: (c) => (
        <div className="flex flex-col">
          <p className="text-[12.5px] font-semibold text-foreground line-clamp-1">{c.user.name || "Unknown"}</p>
          <p className="text-[11px] text-muted-foreground">{c.user.email}</p>
        </div>
      ),
    },
    {
      key: "webinar",
      label: "Webinar",
      render: (c) => (
        <span className="text-[12px] font-medium text-foreground line-clamp-2">{c.webinar.title}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (c) => (
        <StatusBadge
          label={c.isValid ? "Valid" : "Dicabut"}
          variant={c.isValid ? "success" : "error"}
        />
      ),
    },
    {
      key: "issueDate",
      label: "Tgl. Terbit",
      render: (c) => (
        <span className="text-[11.5px] text-muted-foreground">
          {new Date(c.issueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      className: "text-right",
      render: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
             <DropdownMenuLabel className="text-[11px] font-semibold uppercase text-muted-foreground">
              Aksi
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleToggleStatus(c)}>
              {c.isValid ? (
                <><PowerOff className="mr-2 h-3.5 w-3.5 text-rose-500" /> Cabut Sertifikat</>
              ) : (
                <><Power className="mr-2 h-3.5 w-3.5 text-emerald-500" /> Validasi Kembali</>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[12px] text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50 cursor-pointer"
              onClick={() => setDeleteDialog({ cert: c, open: true })}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Sertifikat Digital</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Penerbitan dan manajemen status kelulusan peserta.</p>
        </div>
        <Button onClick={() => setFormDialog(true)} className="h-9 gap-2 shadow-sm whitespace-nowrap">
          <Plus size={16} />
          Terbitkan Manual
        </Button>
      </div>

      <DataTable
        data={certificates}
        columns={columns}
        searchKey="certificateNumber"
        searchPlaceholder="Cari nomor sertifikat..."
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Sertifikat</DialogTitle>
            <DialogDescription className="text-[12px]">
              Apakah Anda yakin ingin menghapus sertifikat <strong>{deleteDialog.cert?.certificateNumber}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ cert: null, open: false })} className="text-[12px]">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="text-[12px]">
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Form Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
            <DialogTitle className="text-lg">Terbitkan Sertifikat Baru</DialogTitle>
            <DialogDescription className="text-[13px]">
              Masukkan email peserta dan slug webinar untuk menerbitkan sertifikat secara manual. Pastikan peserta sudah terdaftar pada webinar tersebut.
            </DialogDescription>
          </DialogHeader>
          <CertificateForm onSuccess={() => setFormDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
