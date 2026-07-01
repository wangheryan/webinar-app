// src/app/auth/error/page.tsx
"use client";

import { useEffect, useState, useTransition, Suspense, use } from "react";
import { signOut } from "next-auth/react";
import { ShieldAlert, RefreshCw, LogIn, Terminal, HelpCircle, Key, AlertCircle } from "lucide-react";



interface AuthErrorContentProps {
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface ErrorStateDetails {
  title: string;
  message: string;
  code: string;
  icon: React.ReactNode;
}

// ── LAYER 1: VIEW COMPONENT DENGAN LOGIKA PEMETAAN ALL ERRORS ──
function AuthErrorContent({ searchParamsPromise }: AuthErrorContentProps) {
  const resolvedSearchParams = use(searchParamsPromise);
  const [isPending, startTransition] = useTransition();



  const errorType = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;

  const [errorDetails, setErrorDetails] = useState<ErrorStateDetails>({
    title: "defaultTitle",
    message: "defaultMessaget(",
    code: ")UNKNOWN_AUTH_ERROR",
    icon: <ShieldAlert size={24} />,
  });

  useEffect(() => {
    // 🌟 PERBAIKAN UTAMA: Bungkus operasi asinkronus ke dalam fungsi terisolasi 
    // agar update state 'setErrorDetails' tidak balapan dengan penghancuran cookie session
    const cleanupAndMapErrors = () => {
      startTransition(async () => {
        try {
          // 1. Eksekusi pembersihan kuki sesi stale di lokal browser secara asinkronus
          await signOut({ redirect: false });
        } catch (err) {
          console.error("❌ Failed to clear stale session cookies:", err);
        }

        // 2. Pemetaan kondisi eror diproses setelah proses jabat tangan selesai
        switch (errorType) {
          case "OAuthAccountDisabled":
            setErrorDetails({
              title: "oauthDisabledTitle",
              message: "oauthDisabledMessaget(",
              code: ")ERR_OAUTH_NODE_DISABLED",
              icon: <AlertCircle size={24} className="text-red-500" />,
            });
            break;

          case "OAuthSignin":
            setErrorDetails({
              title: "oauthSigninTitle",
              message: "oauthSigninMessaget(",
              code: ")ERR_OAUTH_SIGNIN_HANDSHAKE",
              icon: <Key size={24} className="text-amber-500" />,
            });
            break;

          case "OAuthCallback":
            setErrorDetails({
              title: "oauthCallbackTitle",
              message: "oauthCallbackMessaget(",
              code: ")ERR_OAUTH_CALLBACK_MUTATION",
              icon: <ShieldAlert size={24} className="text-destructive" />,
            });
            break;

          case "OAuthAccountNotLinked":
            setErrorDetails({
              title: "oauthCollisionTitle",
              message: "oauthCollisionMessaget(",
              code: ")ERR_ACCOUNT_LINK_COLLISION",
              icon: <Key size={24} className="text-sky-500" />,
            });
            break;

          case "SessionRequired":
            setErrorDetails({
              title: "sessionRequiredTitle",
              message: "sessionRequiredMessaget(",
              code: ")ERR_SESSION_ACCESS_REQUIRED",
              icon: <ShieldAlert size={24} className="text-amber-500" />,
            });
            break;

          case "AccessDenied":
            setErrorDetails({
              title: "accessDeniedTitle",
              message: "accessDeniedMessaget(",
              code: ")ERR_RBAC_ACCESS_DENIED",
              icon: <ShieldAlert size={24} className="text-destructive" />,
            });
            break;

          default:
            setErrorDetails({
              title: "defaultTitle",
              message: "unknownErrorMessaget(",
              code: errorType ? `ERR_UNKNOWN_${errorType.toUpperCase()}` : ")ERR_GENERIC_AUTH_EXCEPTION",
              icon: <HelpCircle size={24} className="text-muted-foreground" />,
            });
        }
      });
    };

    cleanupAndMapErrors();
  }, [errorType]);

  return (
    <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-6 shadow-4xs font-sans">

      {/* HEADER INDICATOR */}
      <div className="flex flex-col items-center text-center space-y-2.5">
        <div className="h-12 w-12 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center text-destructive animate-pulse">
          {errorDetails.icon}
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-destructive uppercase tracking-widest block">
            {"Aliran Kesalahan"}
          </span>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {errorDetails.title}
          </h1>
        </div>
      </div>

      {/* TERMINAL LOG DISPLAY */}
      <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[10px] border-b border-border/40 pb-2">
          <Terminal size={12} /> {"Aliran Log Utama"}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {errorDetails.message}
        </p>
        <div className="text-[10px] text-destructive/80 font-semibold pt-1 uppercase tracking-wider">
          {"Kode ID Sistem"}{errorDetails.code}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <button
          onClick={() => {
            window.location.href = `/auth/login`;
          }}
          disabled={isPending}
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs disabled:opacity-50"
        >
          {isPending ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <>
              <LogIn size={14} />
              <span>{"Bersihkan Sesi & Coba Lagi"}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

// ── LAYER 2: BOUNDARY SYSTEM LOADER (SANGAT WAJIB PADA NEXT.JS DENGAN ASYNC SEARCHPARAMS) ──
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function AuthErrorPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 antialiased select-none">
      <Suspense
        fallback={
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md text-xs text-muted-foreground flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> INITIALIZING_ISOLATED_NODE...
          </div>
        }
      >
        <AuthErrorContent searchParamsPromise={searchParams} />
      </Suspense>
    </main>
  );
}