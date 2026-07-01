"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Shield, User, Trash2, Power, PowerOff } from "lucide-react";

import { AdminUser, toggleUserStatus, updateUserRole, deleteUser } from "./actions";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
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

export function UsersClient({ users }: { users: AdminUser[] }) {

  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ user: AdminUser | null; open: boolean }>({ user: null, open: false });

  const handleToggleStatus = (user: AdminUser) => {
    startTransition(async () => {
      try {
        await toggleUserStatus(user.id);
        toast.success("updateSuccess");
      } catch {
        toast.error("updateError");
      }
    });
  };

  const handleChangeRole = (user: AdminUser, role: "ADMINISTRATOR" | "PARTICIPANT") => {
    startTransition(async () => {
      try {
        await updateUserRole(user.id, role);
        toast.success("roleSuccess");
      } catch {
        toast.error("roleError");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.user) return;
    startTransition(async () => {
      try {
        await deleteUser(deleteDialog.user!.id);
        toast.success("deleteSuccess");
        setDeleteDialog({ user: null, open: false });
      } catch {
        toast.error("deleteError");
      }
    });
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      label: "colUser",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-[13px] shadow-sm ring-2 ring-background">
            {(u.name || u.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[12.5px] font-semibold  text-foreground line-clamp-1">{u.name || "unknown"}</p>
            <p className="text-[11px] text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "colRole",
      render: (u) => (
        <div className="flex items-center gap-1.5">
          {u.role === "ADMINISTRATOR" ? (
            <StatusBadge label="Admin" variant="premium" />
          ) : (
            <StatusBadge label="User" variant="neutral" />
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "colStatus",
      render: (u) => (
        <StatusBadge
          label={u.isActive ? "statusActive" : "statusInactive"}
          variant={u.isActive ? "success" : "error"}
        />
      ),
    },
    {
      key: "orders",
      label: "colOrders",
      className: "text-center",
      render: (u) => (
        <span className="text-[12px] font-semibold ">{u._count?.orders || 0}</span>
      ),
    },
    {
      key: "joined",
      label: "colJoined",
      render: (u) => (
        <span className="text-[11.5px] text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "colActions",
      className: "text-right",
      render: (u) => (
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

            <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleToggleStatus(u)}>
              {u.isActive ? (
                <><PowerOff className="mr-2 h-3.5 w-3.5 text-rose-500" /> {"Ubah Status"}</>
              ) : (
                <><Power className="mr-2 h-3.5 w-3.5 text-emerald-500" /> {"Ubah Status"}</>
              )}
            </DropdownMenuItem>

            {u.role === "PARTICIPANT" ? (
              <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleChangeRole(u, "ADMINISTRATOR")}>
                <Shield className="mr-2 h-3.5 w-3.5 text-indigo-500" /> {"Jadikan Administrator"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleChangeRole(u, "PARTICIPANT")}>
                <User className="mr-2 h-3.5 w-3.5 text-slate-500" /> {"Hapus Akses Admin"}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[12px] text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50 cursor-pointer"
              onClick={() => setDeleteDialog({ user: u, open: true })}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> {"Hapus"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{"Judul"}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Kelola {users.length} pengguna platform</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchKey="name"
        searchPlaceholder={"Cari pengguna..."}
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Pengguna</DialogTitle>
            <DialogDescription className="text-[12px]">
              Apakah Anda yakin ingin menghapus pengguna <strong>{deleteDialog.user?.name || deleteDialog.user?.email || ""}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ user: null, open: false })} className="text-[12px]">
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
