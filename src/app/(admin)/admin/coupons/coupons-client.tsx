"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, MoreVertical, Edit, Trash2, Power, PowerOff } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AdminCoupon,
  createCoupon,
  updateCoupon,
  toggleCouponActive,
  deleteCoupon,
} from "./actions";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const couponSchema = z.object({
  code: z.string().min(3, "Kode kupon minimal 3 karakter").toUpperCase(),
  type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
  value: z.number().min(1, "Nilai kupon minimal 1"),
  maxDiscount: z.number().min(0).optional(),
  minPurchase: z.number().min(0, "Minimal belanja tidak boleh negatif"),
  qtyTotal: z.number().min(1, "Kuota total minimal 1"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal berakhir wajib diisi"),
}).refine(data => {
  if (data.type === "PERCENTAGE" && data.value > 100) return false;
  return true;
}, {
  message: "Nilai persentase tidak boleh lebih dari 100",
  path: ["value"]
}).refine(data => {
  return new Date(data.startDate) < new Date(data.endDate);
}, {
  message: "Tanggal mulai harus sebelum tanggal berakhir",
  path: ["endDate"]
});

type CouponFormValues = z.infer<typeof couponSchema>;

export function CouponsClient({ coupons }: { coupons: AdminCoupon[] }) {

  const [isPending, startTransition] = useTransition();
  const [formDialog, setFormDialog] = useState<{ open: boolean; mode: "create" | "edit"; id?: string }>({ open: false, mode: "create" });
  const [deleteDialog, setDeleteDialog] = useState<{ coupon: AdminCoupon | null; open: boolean }>({ coupon: null, open: false });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "PERCENTAGE",
      value: 0,
      minPurchase: 0,
      qtyTotal: 10,
      startDate: "",
      endDate: "",
    }
  });

  const watchedType = watch("type");

  const handleToggleStatus = (coupon: AdminCoupon) => {
    startTransition(async () => {
      try {
        await toggleCouponActive(coupon.id);
        toast.success("updateSuccess");
      } catch {
        toast.error("updateError");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.coupon) return;
    startTransition(async () => {
      try {
        await deleteCoupon(deleteDialog.coupon!.id);
        toast.success("deleteSuccess");
        setDeleteDialog({ coupon: null, open: false });
      } catch {
        toast.error("deleteError");
      }
    });
  };

  const onSubmit = (data: CouponFormValues) => {
    startTransition(async () => {
      try {
        if (formDialog.mode === "create") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await createCoupon(data as any);
          toast.success("createSuccess");
        } else if (formDialog.id) {
          await updateCoupon(formDialog.id, data);
          toast.success("updateSuccess");
        }
        setFormDialog({ open: false, mode: "create" });
        reset();
      } catch {
        toast.error("saveError");
      }
    });
  };

  const openCreate = () => {
    reset({
      code: "",
      type: "PERCENTAGE",
      value: 0,
      minPurchase: 0,
      qtyTotal: 10,
      maxDiscount: undefined,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    });
    setFormDialog({ open: true, mode: "create" });
  };

  const openEdit = (c: AdminCoupon) => {
    reset({
      code: c.code,
      type: c.type,
      value: c.value,
      maxDiscount: c.maxDiscount || undefined,
      minPurchase: c.minPurchase,
      qtyTotal: c.qtyTotal,
      startDate: new Date(c.startDate).toISOString().slice(0, 16),
      endDate: new Date(c.endDate).toISOString().slice(0, 16),
    });
    setFormDialog({ open: true, mode: "edit", id: c.id });
  };

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      label: "colCode",
      render: (c) => (
        <div>
          <p className="text-[12.5px] font-semibold text-foreground uppercase">{c.code}</p>
          <p className="text-[11px] text-muted-foreground">
            {c.type === "FIXED_AMOUNT" ? "typeFixed" : "typePercentaget("}
          </p>
        </div>
      ),
    },
    {
      key: ")value",
      label: "colValue",
      render: (c) => (
        <div className="flex flex-col">
          <span className="text-[12.5px] font-semibold  text-foreground">
            {c.type === "FIXED_AMOUNT" ? formatCurrency(c.value) : `${c.value}%`}
          </span>
          {c.maxDiscount && (
            <span className="text-[10px] text-muted-foreground">
              Max: {formatCurrency(c.maxDiscount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "usaget(",
      label: ")colUsaget(",
      className: ")text-center",
      render: (c) => (
        <div className="flex flex-col items-center">
          <span className="text-[12.5px] font-semibold  text-foreground">
            {c._count.usages} / {c.qtyTotal}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {c.qtyAvailable} left
          </span>
        </div>
      ),
    },
    {
      key: "dates",
      label: "colDates",
      render: (c) => (
        <div className="flex flex-col text-[11px] text-muted-foreground">
          <span>{new Date(c.startDate).toLocaleDateString()}</span>
          <span>{new Date(c.endDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "colStatus",
      render: (c) => (
        <StatusBadge
          label={c.isActive ? "statusActive" : "statusInactive"}
          variant={c.isActive ? "success" : "error"}
        />
      ),
    },
    {
      key: "actions",
      label: "colActions",
      className: "text-right",
      render: (c) => (
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

            <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => handleToggleStatus(c)}>
              {c.isActive ? (
                <><PowerOff className="mr-2 h-3.5 w-3.5 text-amber-500" /> {"Ubah Status"}</>
              ) : (
                <><Power className="mr-2 h-3.5 w-3.5 text-emerald-500" /> {"Ubah Status"}</>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => openEdit(c)}>
              <Edit className="mr-2 h-3.5 w-3.5 text-indigo-500" /> {"Sunting"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[12px] text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50 cursor-pointer"
              onClick={() => setDeleteDialog({ coupon: c, open: true })}
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
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Kupon Promo</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Kelola {coupons.length} kupon promo</p>
      </div>

      <DataTable
        data={coupons}
        columns={columns}
        searchKey="code"
        searchPlaceholder={"Cari berdasarkan nama atau email..."}
        actions={
          <Button
            className="h-9 gap-2 text-[12px] font-semibold  rounded-xl cursor-pointer"
            onClick={openCreate}
          >
            <Plus size={14} /> {"Tambah Baru"}
          </Button>
        }
      />

      {/* Create / Edit Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-[15px]">
                {formDialog.mode === "create" ? "dlgCreateTitle" : "dlgEditTitle"}
              </DialogTitle>
              <DialogDescription className="text-[12px]">
                {formDialog.mode === "create" ? "dlgCreateDesc" : "dlgEditDesc"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Kode Kupon"}</Label>
                <Input
                  {...register("code")}
                  className="text-[12px] uppercase"
                  placeholder="PROMO2026"
                />
                {errors.code && <p className="text-[10px] text-destructive">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Tipe Promo"}</Label>
                <Select value={watchedType} onValueChange={(v) => setValue("type", v as "PERCENTAGE" | "FIXED_AMOUNT")}>
                  <SelectTrigger className="text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE" className="text-[12px]">{"typePercentaget("}</SelectItem>
                    <SelectItem value=")FIXED_AMOUNT" className="text-[12px]">{"Nominal Pasti"}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-[10px] text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Nilai Potongan"} {watchedType === "PERCENTAGE" && "(%)"}</Label>
                <Input type="number" {...register("value", { valueAsNumber: true })} className="text-[12px]" />
                {errors.value && <p className="text-[10px] text-destructive">{errors.value.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Batas Maksimal Potongan"} {watchedType === "PERCENTAGE" && "(IDR)"}</Label>
                <Input
                  type="number"
                  {...register("maxDiscount", { valueAsNumber: true })}
                  className="text-[12px]"
                  disabled={watchedType === "FIXED_AMOUNT"}
                  placeholder="Optional"
                />
                {errors.maxDiscount && <p className="text-[10px] text-destructive">{errors.maxDiscount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Minimum Pembelian"} (IDR)</Label>
                <Input type="number" {...register("minPurchase", { valueAsNumber: true })} className="text-[12px]" />
                {errors.minPurchase && <p className="text-[10px] text-destructive">{errors.minPurchase.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Batas Penggunaan"}</Label>
                <Input type="number" {...register("qtyTotal", { valueAsNumber: true })} className="text-[12px]" />
                {errors.qtyTotal && <p className="text-[10px] text-destructive">{errors.qtyTotal.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Masa Berlaku Mulai"}</Label>
                <Input type="datetime-local" {...register("startDate")} className="text-[12px]" />
                {errors.startDate && <p className="text-[10px] text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold ">{"Masa Berlaku Berakhir"}</Label>
                <Input type="datetime-local" {...register("endDate")} className="text-[12px]" />
                {errors.endDate && <p className="text-[10px] text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormDialog({ ...formDialog, open: false })} className="text-[12px]" disabled={isPending}>
                {"Batal"}
              </Button>
              <Button type="submit" disabled={isPending} className="text-[12px]">
                {isPending ? "btnSaving" : formDialog.mode === "create" ? "btnCreate" : "btnUpdate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-rose-500">Hapus Kupon</DialogTitle>
            <DialogDescription className="text-[12px]">
              Anda yakin ingin menghapus kupon <strong>{deleteDialog.coupon?.code || ""}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ coupon: null, open: false })} className="text-[12px]" disabled={isPending}>
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
