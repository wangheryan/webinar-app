"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createCertificate } from "@/actions/certificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  webinarSlug: z.string().min(3, "Slug webinar wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

export function CertificateForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      webinarSlug: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const result = await createCertificate(data.email, data.webinarSlug);
        
        if (result.success) {
          toast.success("Sertifikat berhasil diterbitkan!");
          onSuccess();
        } else {
          toast.error(result.error || "Gagal menerbitkan sertifikat.");
        }
      } catch {
        toast.error("Terjadi kesalahan pada sistem.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
      <div className="space-y-1.5">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase">Email Peserta</Label>
        <Input 
          type="email" 
          placeholder="user@example.com" 
          className="h-10 text-[13px] rounded-lg bg-background/50" 
          {...register("email")} 
        />
        {errors.email && <p className="text-[10px] text-destructive font-bold">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase">Slug Webinar</Label>
        <Input 
          placeholder="masterclass-react-js" 
          className="h-10 text-[13px] rounded-lg bg-background/50" 
          {...register("webinarSlug")} 
        />
        {errors.webinarSlug && <p className="text-[10px] text-destructive font-bold">{errors.webinarSlug.message}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">Ambil dari URL webinar. Contoh: /u/webinars/<strong>masterclass-react-js</strong></p>
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
          disabled={isPending}
          className="rounded-lg text-xs font-semibold px-6"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Terbitkan
        </Button>
      </div>
    </form>
  );
}
