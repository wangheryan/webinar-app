"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Send, AlertCircle, Loader2 } from "lucide-react";
import { sendAdminMessage } from "./actions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  toEmails: z.string().min(1, "Alamat email tujuan harus diisi"),
  subject: z.string().min(1, "Subjek pesan harus diisi"),
  message: z.string().min(10, "Pesan terlalu singkat (minimal 10 karakter)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MessagingClient() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toEmails: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await sendAdminMessage(values);
      if (!result.success) {
        toast.error(result.error || "Gagal mengirim pesan.");
      } else {
        toast.success("Pesan berhasil terkirim ke seluruh tujuan!");
        reset(); // Kosongkan form jika sukses
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Mail size={24} />
          </div>
          Perpesanan
        </h1>
        <p className="text-muted-foreground mt-2">
          Kirim pesan pengumuman atau notifikasi kepada peserta dan pengguna platform.
        </p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Tulis Pesan Baru</CardTitle>
          <CardDescription>
            Pesan akan dibungkus dengan template email HTML Geomining yang rapi.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="toEmails">Kirim Kepada</Label>
              <Input
                id="toEmails"
                placeholder="email1@gmail.com, email2@yahoo.com (Pisahkan dengan koma)"
                {...register("toEmails")}
                className="w-full"
                disabled={isPending}
              />
              {errors.toEmails && (
                <p className="text-[13px] text-destructive flex items-center gap-1.5 mt-1">
                  <AlertCircle size={14} /> {errors.toEmails.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subjek Email</Label>
              <Input
                id="subject"
                placeholder="Pembaruan Jadwal Webinar..."
                {...register("subject")}
                className="w-full font-medium"
                disabled={isPending}
              />
              {errors.subject && (
                <p className="text-[13px] text-destructive flex items-center gap-1.5 mt-1">
                  <AlertCircle size={14} /> {errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Isi Pesan</Label>
              <Textarea
                id="message"
                placeholder="Tuliskan pesan Anda di sini..."
                {...register("message")}
                className="min-h-[250px] resize-y"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground mt-2">
                * Teks akan diformat per paragraf sesuai ketikan Anda.
              </p>
              {errors.message && (
                <p className="text-[13px] text-destructive flex items-center gap-1.5 mt-1">
                  <AlertCircle size={14} /> {errors.message.message}
                </p>
              )}
            </div>

          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border/50 px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Pastikan Anda telah mengecek ulang isi pesan.
            </span>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Pesan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
