"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon2 } from "lucide-react";
import Image from "next/image";

import { createSpeaker, updateSpeaker, type SpeakerInput } from "@/actions/speaker";
import type { Speaker } from "./instructors-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(3, "Nama wajib diisi (minimal 3 karakter)"),
  title: z.string().min(3, "Jabatan / Gelar utama wajib diisi"),
  company: z.string().optional(),
  image: z.string().min(1, "Foto profil wajib diisi"),
  bio: z.string().optional(),
  credentialsString: z.string().optional(),
  linkedinUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  websiteUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function InstructorForm({
  initialData,
  onSuccess,
}: {
  initialData?: Speaker;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues: FormValues = {
    name: initialData?.name || "",
    title: initialData?.title || "",
    company: initialData?.company || "",
    image: initialData?.image || "",
    bio: initialData?.bio || "",
    credentialsString: initialData?.credentials?.join(", ") || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    websiteUrl: initialData?.websiteUrl || "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedImageUrl = watch("image");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "speaker"); // Tipe baru di-handle di route.ts

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto");

      setValue("image", data.url, { shouldValidate: true });
      toast.success("Foto berhasil diunggah");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan upload");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const credentials = data.credentialsString
          ? data.credentialsString.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const payload: SpeakerInput = {
          name: data.name,
          title: data.title,
          company: data.company || null,
          image: data.image,
          bio: data.bio || null,
          credentials,
          linkedinUrl: data.linkedinUrl || null,
          websiteUrl: data.websiteUrl || null,
        };

        let result;
        if (initialData) {
          result = await updateSpeaker(initialData.id, payload);
        } else {
          result = await createSpeaker(payload);
        }

        if (result.success) {
          toast.success(initialData ? "Data instruktur diperbarui." : "Instruktur berhasil ditambahkan.");
          onSuccess();
        } else {
          toast.error(result.error || "Gagal menyimpan data.");
        }
      } catch {
        toast.error("Terjadi kesalahan pada sistem.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      {/* Upload Foto */}
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start p-4 rounded-xl border border-border/60 bg-muted/20">
        <div className="w-20 h-20 shrink-0 rounded-full border-2 border-border/60 bg-background overflow-hidden relative flex items-center justify-center">
          {watchedImageUrl ? (
            <Image src={watchedImageUrl} alt="Preview" fill className="object-cover" />
          ) : (
            <ImageIcon2 className="h-8 w-8 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div>
            <h3 className="font-bold text-[13px] text-foreground">Foto Profil Instruktur</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Disarankan rasio 1:1 (persegi), maks 5MB.</p>
          </div>
          <label className="cursor-pointer bg-background border border-border/60 shadow-sm rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-muted/50 transition-colors">
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1.5" /> : null}
            {isUploading ? "Mengunggah..." : "Pilih Foto"}
            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>
      {errors.image && <p className="text-[11px] text-destructive font-bold text-center sm:text-left">{errors.image.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        {/* Nama */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Lengkap</Label>
          <Input placeholder="Contoh: Dr. Eng. John Doe, M.T." className="h-9 text-[13px] rounded-lg" {...register("name")} />
          {errors.name && <p className="text-[10px] text-destructive font-bold">{errors.name.message}</p>}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">Jabatan / Keahlian</Label>
          <Input placeholder="Contoh: Senior Geologist" className="h-9 text-[13px] rounded-lg" {...register("title")} />
          {errors.title && <p className="text-[10px] text-destructive font-bold">{errors.title.message}</p>}
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">Perusahaan / Afiliasi</Label>
          <Input placeholder="Contoh: PT Tambang Makmur" className="h-9 text-[13px] rounded-lg" {...register("company")} />
        </div>

        {/* Credentials */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">Kredensial / Sertifikasi</Label>
          <Input placeholder="Contoh: CPI, KCMI, PMP (pisahkan dengan koma)" className="h-9 text-[13px] rounded-lg" {...register("credentialsString")} />
          <p className="text-[10px] text-muted-foreground">Opsional. Daftar keahlian spesifik.</p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">Biografi Singkat</Label>
          <Textarea placeholder="Latar belakang pengalaman instruktur..." className="min-h-[80px] text-[13px] rounded-lg resize-none" {...register("bio")} />
        </div>

        {/* LinkedIn */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">URL LinkedIn</Label>
          <Input placeholder="https://linkedin.com/in/..." className="h-9 text-[13px] rounded-lg" {...register("linkedinUrl")} />
          {errors.linkedinUrl && <p className="text-[10px] text-destructive font-bold">{errors.linkedinUrl.message}</p>}
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase">URL Website</Label>
          <Input placeholder="https://..." className="h-9 text-[13px] rounded-lg" {...register("websiteUrl")} />
          {errors.websiteUrl && <p className="text-[10px] text-destructive font-bold">{errors.websiteUrl.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isPending}
          className="rounded-lg text-xs font-semibold px-4"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="rounded-lg text-xs font-semibold px-6"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? "Simpan Perubahan" : "Simpan Instruktur"}
        </Button>
      </div>
    </form>
  );
}
