"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createWebinar, updateWebinar, type AdminWebinar } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Image as ImageIcon2, ChevronDown, Check, Info, Calendar, DollarSign, Layers } from "lucide-react";
/* eslint-disable @next/next/no-img-element */

const webinarSchema = z.object({
  title: z.string().min(3, "Judul wajib diisi"),
  slug: z.string().min(3, "Slug wajib diisi"),
  subtitle: z.string().min(5, "Subtitle wajib diisi"),
  abstract: z.string().min(10, "Abstrak wajib diisi"),
  description: z.string().optional(),
  category: z.string().min(2, "Kategori wajib diisi"),
  duration: z.string().min(1, "Durasi wajib diisi (misal: '2 Jam')"),
  accessType: z.enum(["FREE", "PAID", "HYBRID"]),
  basePrice: z.number().min(0, "Harga tidak boleh negatif"),
  imageUrl: z.string().url("URL gambar tidak valid"),
  materialUrl: z.string().optional().or(z.literal("")),
  isLive: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  speakerIds: z.array(z.string()).min(1, "Pilih minimal 1 instruktur"),
  addons: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Nama layanan wajib"),
      price: z.number().min(0, "Harga tidak boleh negatif"),
      description: z.string().optional(),
      isActive: z.boolean(),
      isDeleted: z.boolean().optional(),
    })
  ),
  sessions: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Judul sesi wajib"),
      startDate: z.string().min(1, "Waktu mulai wajib"),
      endDate: z.string().min(1, "Waktu selesai wajib"),
      duration: z.string().optional(),
      meetingUrl: z.string().optional().or(z.literal("")),
      recordingUrl: z.string().optional().or(z.literal("")),
      isDeleted: z.boolean().optional(),
    })
  ),
  faqs: z.array(
    z.object({
      question: z.string().min(1, "Pertanyaan wajib"),
      answer: z.string().min(1, "Jawaban wajib"),
    })
  ),
  resources: z.array(
    z.object({
      title: z.string().min(1, "Judul dokumen wajib"),
      url: z.string().url("Format URL tidak valid").or(z.literal("")),
    })
  ),
});

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return isoString;
  }
};

type WebinarFormValues = z.infer<typeof webinarSchema>;

export function WebinarForm({
  initialSpeakers,
  initialData,
}: {
  initialSpeakers: { id: string; name: string; title: string }[];
  initialData?: AdminWebinar;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "schedule" | "content">("basic");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<WebinarFormValues>({
    resolver: zodResolver(webinarSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      slug: initialData.slug,
      subtitle: initialData.subtitle,
      abstract: initialData.abstract,
      description: initialData.description || "",
      category: initialData.category,
      duration: initialData.duration || "",
      accessType: initialData.accessType as "FREE" | "PAID" | "HYBRID",
      basePrice: initialData.basePrice,
      imageUrl: initialData.imageUrl,
      materialUrl: initialData.materialUrl || "",
      isLive: initialData.isLive,
      isCompleted: initialData.isCompleted,
      speakerIds: initialData.speakers?.map(s => s.id) || [],
      addons: initialData.addons?.map(a => ({
        id: a.id,
        name: a.name,
        price: a.price,
        description: a.description || "",
        isActive: a.isActive
      })) || [],
      sessions: initialData.sessions?.map(s => ({
        id: s.id,
        title: s.title,
        startDate: formatDateForInput(s.startDate),
        endDate: formatDateForInput(s.endDate),
        duration: s.duration || "",
        meetingUrl: s.meetingUrl || "",
        recordingUrl: s.recordingUrl || ""
      })) || [],
      faqs: [],
      resources: initialData.resources || [],
    } : {
      title: "",
      slug: "",
      subtitle: "",
      abstract: "",
      description: "",
      category: "",
      duration: "",
      accessType: "PAID",
      basePrice: 0,
      imageUrl: "",
      materialUrl: "",
      isLive: false,
      isCompleted: false,
      speakerIds: [],
      addons: [],
      sessions: [],
      faqs: [],
      resources: [],
    },
  });

  const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({ control, name: "addons" });
  const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ control, name: "sessions" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: "faqs" });
  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({ control, name: "resources" });

  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);
  const [deletedAddonIds, setDeletedAddonIds] = useState<string[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleRemoveSession = (idx: number) => {
    const s = getValues(`sessions.${idx}`);
    if (s && s.id) setDeletedSessionIds(prev => [...prev, s.id!]);
    removeSession(idx);
  };

  const handleRemoveAddon = (idx: number) => {
    const a = getValues(`addons.${idx}`);
    if (a && a.id) setDeletedAddonIds(prev => [...prev, a.id!]);
    removeAddon(idx);
  };

  const watchedTitle = watch("title");
  const watchedImageUrl = watch("imageUrl");
  
  useEffect(() => {
    // Auto-generate slug when title changes (hanya jika baru dibuat, atau jika user mengetik)
    // Jika sedang edit (initialData ada), lebih baik tidak mengubah slug agar tidak merusak link lama.
    if (!initialData && watchedTitle) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchedTitle, initialData, setValue]);

  const watchedAccessType = watch("accessType");
  const watchedSpeakerIds = watch("speakerIds");
  const watchedIsLive = watch("isLive");
  const watchedIsCompleted = watch("isCompleted");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    // Kita set value ke preview URL (blob) sementara agar form validation lulus.
    // Upload yang sebenarnya akan terjadi saat user klik Simpan.
    setValue("imageUrl", previewUrl, { shouldValidate: true });
  };

  const onSubmit = (data: WebinarFormValues) => {
    const finalData = { ...data };
    
    if (deletedSessionIds.length > 0) {
      finalData.sessions = [
        ...finalData.sessions,
        ...deletedSessionIds.map(id => ({
          id,
          title: "deleted",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isDeleted: true
        }))
      ];
    }
    
    if (deletedAddonIds.length > 0) {
      finalData.addons = [
        ...finalData.addons,
        ...deletedAddonIds.map(id => ({
          id,
          name: "deleted",
          price: 0,
          isActive: false,
          isDeleted: true
        }))
      ];
    }

    startTransition(async () => {
      try {
        // Upload gambar ke Cloudinary JIKA ADA file baru yang dipilih
        if (imageFile) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("type", "webinar");
          
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await res.json();
          if (!res.ok) throw new Error(uploadData.error || "Gagal mengunggah gambar");
          
          finalData.imageUrl = uploadData.url;
          setIsUploading(false);
        }

        if (initialData) {
          await updateWebinar(initialData.id, finalData);
          toast.success("Webinar berhasil diperbarui!");
        } else {
          await createWebinar(finalData);
          toast.success("Webinar berhasil diterbitkan!");
        }
        router.push("/admin/webinars");
      } catch (error) {
        setIsUploading(false);
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan webinar");
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all ${
        activeTab === id 
          ? "border-primary text-primary bg-primary/5" 
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full pb-20">
      {/* ── Header Top Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{initialData ? "Edit Webinar" : "Buat Webinar Baru"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Lengkapi data informasi kelas, jadwal sesi, dan opsi pendaftaran.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-5 text-xs font-bold border-border/60 shadow-sm"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="rounded-xl px-6 text-xs font-bold shadow-md transition-transform hover:-translate-y-0.5"
            disabled={isPending || isUploading}
          >
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : initialData ? "Simpan Perubahan" : "Terbitkan Webinar"}
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex overflow-x-auto border-b border-border/50 mb-8 scrollbar-hide">
        <TabButton id="basic" label="Informasi Utama" icon={Info} />
        <TabButton id="schedule" label="Jadwal & Sesi" icon={Calendar} />
        <TabButton id="pricing" label="Harga & Akses" icon={DollarSign} />
        <TabButton id="content" label="Konten Ekstra" icon={Layers} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Left Column (Main Form Area based on Tab) ── */}
        <div className="w-full lg:w-[65%] space-y-6">
          
          {/* TAB 1: INFORMASI UTAMA */}
          <div className={activeTab === "basic" ? "block" : "hidden"}>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Judul Webinar</Label>
                  <Input placeholder="Contoh: Masterclass React JS" className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px]" {...register("title")} />
                  {errors.title && <p className="text-[10px] text-destructive font-bold">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">URL Slug</Label>
                  <Input placeholder="Contoh: masterclass-react-js" className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px]" {...register("slug")} />
                  {errors.slug && <p className="text-[10px] text-destructive font-bold">{errors.slug.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kategori</Label>
                  <Input placeholder="Contoh: Programming" className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px]" {...register("category")} />
                  {errors.category && <p className="text-[10px] text-destructive font-bold">{errors.category.message}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subtitle (Tagline)</Label>
                  <Input placeholder="Kalimat pendek daya tarik webinar" className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px]" {...register("subtitle")} />
                  {errors.subtitle && <p className="text-[10px] text-destructive font-bold">{errors.subtitle.message}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2 mt-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Deskripsi Singkat (Abstrak)</Label>
                  <Textarea placeholder="Ringkasan eksekutif untuk ditampilkan di kartu" className="min-h-[80px] rounded-xl bg-background/50 border-border/60 text-[13px] resize-y" {...register("abstract")} />
                  {errors.abstract && <p className="text-[10px] text-destructive font-bold">{errors.abstract.message}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2 mt-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Deskripsi Lengkap (Opsional)</Label>
                  <Textarea placeholder="Detail silabus, latar belakang, dan benefit program" className="min-h-[140px] rounded-xl bg-background/50 border-border/60 text-[13px] resize-y" {...register("description")} />
                  {errors.description && <p className="text-[10px] text-destructive font-bold">{errors.description.message}</p>}
                </div>

                {/* Status Toggles */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-border/50 bg-muted/10 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" {...register("isLive")} />
                      <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                    <div className="text-[13px] font-bold text-foreground">Status "Live"<br/><span className="text-[10px] font-medium text-muted-foreground">Webinar sedang berlangsung</span></div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" {...register("isCompleted")} />
                      <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <div className="text-[13px] font-bold text-foreground">Status "Selesai"<br/><span className="text-[10px] font-medium text-muted-foreground">Webinar telah berakhir</span></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: JADWAL & SESI */}
          <div className={activeTab === "schedule" ? "block" : "hidden"}>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm mb-6">
              <div className="space-y-1.5 mb-6">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Durasi Program</Label>
                <Input placeholder="Contoh: 2 Jam 30 Menit" className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px] max-w-sm" {...register("duration")} />
                {errors.duration && <p className="text-[10px] text-destructive font-bold">{errors.duration.message}</p>}
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[14px] text-foreground">Manajemen Sesi Webinar</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Tambahkan sesi untuk webinar multi-hari atau pertemuan berseri.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSession({ title: "", startDate: "", endDate: "", duration: "", meetingUrl: "", recordingUrl: "" })} className="rounded-xl h-8 px-3 text-xs font-bold border-border/60 shadow-3xs gap-1.5">
                    <Plus size={14} /> Tambah Sesi
                  </Button>
                </div>

                <div className="space-y-4">
                  {sessionFields.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-border/60 rounded-xl bg-muted/10 text-muted-foreground text-[13px]">
                      Belum ada sesi ditambahkan. Klik "Tambah Sesi" di atas.
                    </div>
                  )}
                  {sessionFields.map((field, idx) => (
                    <div key={field.id} className="relative p-5 rounded-xl border border-border/60 bg-background shadow-3xs">
                      <button type="button" onClick={() => handleRemoveSession(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-4">Sesi 0{idx + 1}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2 pr-6">
                          <Label className="text-[11px] font-bold text-muted-foreground">Judul Topik Sesi</Label>
                          <Input className="h-9 text-xs rounded-lg bg-muted/20" placeholder="Ex: Pengenalan Ekosistem" {...register(`sessions.${idx}.title`)} />
                          {errors.sessions?.[idx]?.title && <p className="text-[10px] text-destructive font-bold">{errors.sessions[idx].title?.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Waktu Mulai</Label>
                          <Input type="datetime-local" className="h-9 text-xs rounded-lg bg-muted/20" {...register(`sessions.${idx}.startDate`)} />
                          {errors.sessions?.[idx]?.startDate && <p className="text-[10px] text-destructive font-bold">{errors.sessions[idx].startDate?.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Waktu Selesai</Label>
                          <Input type="datetime-local" className="h-9 text-xs rounded-lg bg-muted/20" {...register(`sessions.${idx}.endDate`)} />
                          {errors.sessions?.[idx]?.endDate && <p className="text-[10px] text-destructive font-bold">{errors.sessions[idx].endDate?.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Link Meeting (Zoom/Meet)</Label>
                          <Input className="h-9 text-xs rounded-lg bg-muted/20" placeholder="https://zoom.us/j/..." {...register(`sessions.${idx}.meetingUrl`)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground">Link Rekaman (Video)</Label>
                          <Input className="h-9 text-xs rounded-lg bg-muted/20" placeholder="https://youtube.com/..." {...register(`sessions.${idx}.recordingUrl`)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 3: HARGA & AKSES */}
          <div className={activeTab === "pricing" ? "block" : "hidden"}>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Model Akses</Label>
                  <div className="relative">
                    <select
                      className="flex h-10 w-full appearance-none rounded-xl bg-background/50 border border-border/60 px-3 py-2 text-[13px] font-bold shadow-sm focus-visible:outline-none focus-visible:border-primary"
                      {...register("accessType")}
                    >
                      <option value="PAID">Premium (Berbayar)</option>
                      <option value="FREE">Gratis Akses (Free)</option>
                      <option value="HYBRID">Hybrid (Free & Premium)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"><ChevronDown size={14} /></div>
                  </div>
                  {errors.accessType && <p className="text-[10px] text-destructive font-bold">{errors.accessType.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Harga Dasar (Rp)</Label>
                  <Input
                    type="number"
                    disabled={watchedAccessType === "FREE"}
                    placeholder="Contoh: 150000"
                    className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px] disabled:opacity-50"
                    {...register("basePrice", { valueAsNumber: true })}
                  />
                  {errors.basePrice && <p className="text-[10px] text-destructive font-bold">{errors.basePrice.message}</p>}
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[14px] text-foreground">Layanan Ekstra (Add-ons)</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Berikan opsi up-sell seperti e-sertifikat cetak, konsultasi 1on1.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendAddon({ name: "", price: 0, description: "", isActive: true })} className="rounded-xl h-8 px-3 text-xs font-bold border-border/60 shadow-3xs gap-1.5">
                    <Plus size={14} /> Tambah Opsi
                  </Button>
                </div>

                <div className="space-y-3">
                  {addonFields.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-muted/10 text-muted-foreground text-[13px]">
                      Tidak ada Add-on terdaftar.
                    </div>
                  )}
                  {addonFields.map((field, index) => (
                    <div key={field.id} className="relative p-4 rounded-xl border border-border/60 bg-background flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-1.5 pr-4">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Layanan Tambahan</Label>
                        <Input className="h-9 text-xs rounded-lg" placeholder="Contoh: Akses Video Seumur Hidup" {...register(`addons.${index}.name`)} />
                        {errors.addons?.[index]?.name && <p className="text-[10px] text-destructive font-bold">{errors.addons[index].name?.message}</p>}
                      </div>
                      <div className="w-full sm:w-48 space-y-1.5 pr-8">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Harga (Rp)</Label>
                        <Input type="number" className="h-9 text-xs rounded-lg" placeholder="50000" {...register(`addons.${index}.price`, { valueAsNumber: true })} />
                      </div>
                      <button type="button" onClick={() => handleRemoveAddon(index)} className="absolute top-4 sm:top-1/2 sm:-translate-y-1/2 right-4 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 4: KONTEN EKSTRA */}
          <div className={activeTab === "content" ? "block" : "hidden"}>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm mb-6 space-y-8">
              
              {/* Materi Utama */}
              <div>
                <h3 className="font-bold text-[14px] text-foreground mb-4">Tautan Materi Pendukung</h3>
                <div className="space-y-1.5 max-w-xl">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">URL Dokumen Utama (PDF/Drive)</Label>
                  <Input placeholder="https://drive.google.com/..." className="h-10 rounded-xl bg-background/50 border-border/60 text-[13px]" {...register("materialUrl")} />
                  {errors.materialUrl && <p className="text-[10px] text-destructive font-bold">{errors.materialUrl.message}</p>}
                </div>
              </div>

              {/* Resources */}
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[14px] text-foreground">Referensi Tambahan</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Bahan bacaan pendukung atau tautan eksternal.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendResource({ title: "", url: "" })} className="rounded-xl h-8 px-3 text-xs font-bold border-border/60 shadow-3xs gap-1.5">
                    <Plus size={14} /> Tambah Referensi
                  </Button>
                </div>
                <div className="space-y-3">
                  {resourceFields.map((field, idx) => (
                    <div key={field.id} className="relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/60 bg-background">
                       <div className="flex-1 space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Judul Dokumen</Label>
                        <Input className="h-9 text-xs rounded-lg" placeholder="Dataset Latihan CSV" {...register(`resources.${idx}.title`)} />
                      </div>
                      <div className="flex-1 space-y-1.5 pr-8">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">URL Tautan</Label>
                        <Input className="h-9 text-xs rounded-lg" placeholder="https://..." {...register(`resources.${idx}.url`)} />
                      </div>
                      <button type="button" onClick={() => removeResource(idx)} className="absolute top-4 sm:top-1/2 sm:-translate-y-1/2 right-4 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[14px] text-foreground">FAQ (Tanya Jawab)</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Bantu peserta menjawab pertanyaan umum seputar program ini.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: "", answer: "" })} className="rounded-xl h-8 px-3 text-xs font-bold border-border/60 shadow-3xs gap-1.5">
                    <Plus size={14} /> Tambah FAQ
                  </Button>
                </div>
                <div className="space-y-3">
                  {faqFields.map((field, idx) => (
                    <div key={field.id} className="relative flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-background">
                       <button type="button" onClick={() => removeFaq(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                      <div className="pr-8 space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pertanyaan</Label>
                        <Input className="h-9 text-xs rounded-lg" placeholder="Apakah sertifikat diberikan?" {...register(`faqs.${idx}.question`)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jawaban</Label>
                        <Textarea className="min-h-[60px] text-xs rounded-lg resize-y" placeholder="Ya, e-sertifikat akan dikirim ke email." {...register(`faqs.${idx}.answer`)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Right Column (Sidebar) ── */}
        <div className="w-full lg:w-[35%] space-y-6">
          
          {/* Banner Upload Sidebar */}
          <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <ImageIcon2 size={16} className="text-primary" />
              <h3 className="font-bold text-[14px]">Sampul Webinar</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-video shrink-0 bg-muted/30 rounded-xl flex items-center justify-center overflow-hidden border border-border/60 shadow-inner relative group">
                {watchedImageUrl ? (
                  <img src={watchedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                    <ImageIcon2 className="h-8 w-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Belum ada gambar</span>
                  </div>
                )}
                
                {/* Overlay for hover */}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold">
                    Ubah Gambar
                  </span>
                  <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Format JPG/PNG, maksimal 10MB.<br/>Resolusi optimal 1200x630px.
                </p>
                {errors.imageUrl && <p className="text-[11px] text-destructive font-bold mt-2">{errors.imageUrl.message}</p>}
                
                {!watchedImageUrl && (
                  <label className="mt-3 w-full flex items-center justify-center cursor-pointer bg-primary text-primary-foreground shadow-sm rounded-lg px-4 py-2 text-xs font-bold transition-colors hover:bg-primary/90">
                    Pilih Gambar
                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <h3 className="font-bold text-[14px]">Afiliasi Instruktur</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">Pilih satu atau lebih instruktur yang memandu program ini.</p>

            <div className="space-y-2 mb-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
              {initialSpeakers.map((speaker) => {
                const isSelected = watchedSpeakerIds?.includes(speaker.id);
                return (
                  <label key={speaker.id} className={`flex items-center justify-between p-3 rounded-xl border bg-background cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border/60 hover:border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-[11px] font-bold text-primary">{speaker.name.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-foreground line-clamp-1">{speaker.name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground line-clamp-1">{speaker.title}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border/80'}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <input type="checkbox" value={speaker.id} className="hidden" {...register("speakerIds")} />
                  </label>
                );
              })}
              {initialSpeakers.length === 0 && (
                <div className="p-4 text-center border-2 border-dashed border-border/60 rounded-xl bg-muted/10 text-[11px] text-muted-foreground">
                  Belum ada profil instruktur terdaftar di sistem.
                </div>
              )}
            </div>
            {errors.speakerIds && <p className="text-[10px] text-destructive font-bold">{errors.speakerIds.message}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
