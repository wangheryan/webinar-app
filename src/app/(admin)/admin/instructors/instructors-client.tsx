"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Trash2, Edit, Plus } from "lucide-react";
import Image from "next/image";

import { deleteSpeaker } from "@/actions/speaker";
import { DataTable, type Column } from "@/components/admin/data-table";
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
import { InstructorForm } from "./instructor-form";

// Sesuai dengan prisma schema model Speaker
export type Speaker = {
  id: string;
  name: string;
  title: string;
  company: string | null;
  image: string;
  bio: string | null;
  credentials: string[];
  linkedinUrl: string | null;
  websiteUrl: string | null;
  createdAt: Date;
};

export function InstructorsClient({ instructors }: { instructors: Speaker[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ instructor: Speaker | null; open: boolean }>({ instructor: null, open: false });
  const [formDialog, setFormDialog] = useState<{ open: boolean; instructor?: Speaker }>({ open: false });

  const handleDelete = () => {
    if (!deleteDialog.instructor) return;
    startTransition(async () => {
      try {
        const result = await deleteSpeaker(deleteDialog.instructor!.id);
        if (result.success) {
          toast.success("Instruktur berhasil dihapus.");
        } else {
          toast.error(result.error || "Gagal menghapus instruktur.");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      } finally {
        setDeleteDialog({ instructor: null, open: false });
      }
    });
  };

  const columns: Column<Speaker>[] = [
    {
      key: "instructor",
      label: "Instruktur",
      render: (i) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative rounded-full overflow-hidden border border-border shadow-sm shrink-0 bg-muted flex items-center justify-center">
            {i.image ? (
              <Image src={i.image} alt={i.name} fill className="object-cover" />
            ) : (
              <span className="text-muted-foreground font-medium text-xs">{i.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{i.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{i.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      label: "Perusahaan",
      render: (i) => (
        <span className="text-[12px] text-foreground">{i.company || "-"}</span>
      ),
    },
    {
      key: "credentials",
      label: "Kredensial",
      render: (i) => (
        <div className="flex flex-wrap gap-1">
          {i.credentials && i.credentials.length > 0 ? (
             i.credentials.map((cred, idx) => (
               <span key={idx} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                 {cred}
               </span>
             ))
          ) : (
            <span className="text-muted-foreground text-[11px]">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      className: "text-right",
      render: (i) => (
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
            <DropdownMenuItem 
              className="text-[12px] cursor-pointer" 
              onClick={() => setFormDialog({ open: true, instructor: i })}
            >
              <Edit className="mr-2 h-3.5 w-3.5 text-blue-500" /> Ubah Data
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[12px] text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50 cursor-pointer"
              onClick={() => setDeleteDialog({ instructor: i, open: true })}
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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Instruktur & Praktisi</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Kelola data pemateri, instruktur, atau praktisi untuk webinar.</p>
        </div>
        <Button onClick={() => setFormDialog({ open: true })} className="h-9 gap-2 shadow-sm whitespace-nowrap">
          <Plus size={16} />
          Tambah Instruktur
        </Button>
      </div>

      <DataTable
        data={instructors}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari nama instruktur..."
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Instruktur</DialogTitle>
            <DialogDescription className="text-[12px]">
              Apakah Anda yakin ingin menghapus <strong>{deleteDialog.instructor?.name}</strong>? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi riwayat webinar terkait jika ada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ instructor: null, open: false })} className="text-[12px]">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="text-[12px]">
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
            <DialogTitle className="text-lg">
              {formDialog.instructor ? "Ubah Data Instruktur" : "Tambah Instruktur Baru"}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {formDialog.instructor ? "Perbarui informasi instruktur." : "Masukkan data profil instruktur."}
            </DialogDescription>
          </DialogHeader>
          
          <InstructorForm 
            initialData={formDialog.instructor} 
            onSuccess={() => setFormDialog({ open: false })} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
