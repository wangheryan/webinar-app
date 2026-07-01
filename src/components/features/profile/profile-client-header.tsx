/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Compass, MapPin, Clock, SquarePen, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/icon/avatar";
import Link from "next/link";
import { toast } from "sonner";


interface ProfileClientHeaderProps {
  initialName: string;
  initialJobTitle: string;
  initialCompany: string;
  initialJoinDate: string;
  initialEmploymentStatus: string;
  userRole: string;
  username?: string | null;
  isPublic?: boolean;
  initialAvatar?: string | null;
  initialBanner?: string | null;
}

export function ProfileClientHeader({
  initialName,
  initialJobTitle,
  initialCompany,
  initialJoinDate,
  initialEmploymentStatus,
  userRole,
  username,
  isPublic = false,
  initialAvatar = null,
  initialBanner = null,
}: ProfileClientHeaderProps) {
  const [bannerUrl, setBannerUrl] = useState<string>(initialBanner || "/assets/background-profile.jpg");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);

  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);


  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "avatar" | "banner") => {
    try {
      if (type === "avatar") setIsUploadingAvatar(true);
      else setIsUploadingBanner(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "uploadFailed");
      }

      toast.success(data.message);

      if (type === "avatar") {
        setAvatarUrl(data.url);
      } else {
        setBannerUrl(data.url);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "systemError";
      toast.error(errorMessage);
    } finally {
      if (type === "avatar") setIsUploadingAvatar(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optimistic UI update
      const objectUrl = URL.createObjectURL(file);
      setBannerUrl(objectUrl);
      handleUpload(file, "banner");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optimistic UI update
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      handleUpload(file, "avatar");
    }
  };

  return (
    <div className="relative bg-muted/30 dark:bg-muted/10 pt-24 pb-12 px-4 sm:px-6 md:px-12 overflow-hidden group/hero">

      {/* HIDDEN INPUT FOR CUSTOMIZATION (Hanya Privat) */}
      {!isPublic && (
        <>
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
          <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
        </>
      )}

      {/* 1. GAMBAR BACKGROUND BANNER */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-100 z-0 select-none opacity-[0.55] dark:opacity-[0.45] transition-all duration-300 group-hover/hero:scale-[1.02]"
        style={{ backgroundImage: `url('${bannerUrl}')` }}
      />

      {/* 2. GRADASI TRANSPARAN ADAPTIF */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 dark:via-background/30 to-transparent dark:to-black/10 z-10 pointer-events-none" />

      {/* TOMBOL EDIT BANNER */}
      {!isPublic && (
        <button
          onClick={() => bannerInputRef.current?.click()}
          disabled={isUploadingBanner}
          className="absolute top-4 right-4 z-20 opacity-0 group-hover/hero:opacity-100 flex items-center gap-1.5 bg-background/80 dark:bg-card/80 hover:bg-background disabled:opacity-50 border border-border backdrop-blur-xs text-[10.5px] font-semibold text-foreground px-2.5 py-1 rounded-md shadow-3xs transition-all cursor-pointer"
        >
          {isUploadingBanner ? (
            <Loader2 size={12} className="text-primary animate-spin" />
          ) : (
            <ImageIcon size={12} className="text-primary" />
          )}
          {isUploadingBanner ? "uploading" : "customBanner"}
        </button>
      )}

      {/* KONTEN IDENTITAS UTAMA */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center text-center md:text-left gap-6 relative z-20">

        {/* AVATAR DENGAN ACTION CUSTOM HOVER */}
        <div className="relative w-28 h-28 rounded-full bg-card border-4 border-primary shadow-2xs shrink-0 flex items-center justify-center group/avatar overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile Custom" className="w-full h-full object-cover" />
          ) : (
            <Avatar className="w-full h-full" />
          )}

          {/* Overlay klik ganti foto */}
          {!isPublic && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-semibold gap-1 transition-opacity cursor-pointer disabled:opacity-100"
            >
              {isUploadingAvatar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              <span>{isUploadingAvatar ? "uploadingUpper" : "changet("}</span>
            </button>
          )}
        </div>

        {/* BLOK DATA TEKS */}
        <div className=")flex-1 space-y-2.5 min-w-0">

          <div className="flex items-center justify-center md:justify-start gap-2 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground drop-shadow-2xs">
              {initialName}
            </h1>
            {!isPublic && (
              <Link
                href="/profile/edit"
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted dark:hover:bg-muted/40 rounded-lg transition-all"
                title={"Ubah Data Profil"}
              >
                <SquarePen size={18} />
              </Link>
            )}
          </div>

          <p className="text-xs sm:text-sm text-primary dark:text-sky-400 font-semibold tracking-wide">
            {initialJobTitle}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground/90 dark:text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{initialCompany}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{"Bergabung sejak"} {initialJoinDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-sky-400 border border-primary/20 dark:border-primary/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-3xs">
              ★ {initialEmploymentStatus || "GENERAL"} {"Member"}
            </span>

            {userRole !== "PARTICIPANT" && (
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 rounded-md shadow-3xs">
                {userRole}
              </span>
            )}

            {!isPublic && username && (
              <Link
                href={`/u/${username}`}
                target="_blank"
                className="bg-card border border-border hover:border-primary text-muted-foreground hover:text-foreground text-[9.5px] font-semibold px-3 py-0.5 h-6 rounded-md tracking-wide transition-all inline-flex items-center gap-1.5 shadow-3xs"
              >
                <Compass className="h-3 w-3 text-primary" /> {"Portofolio Publik"}
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}