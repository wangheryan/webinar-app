// src/components/admin/status-badge.tsx
"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "premium";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20",
  error: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border-rose-500/20",
  info: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 border-sky-500/20",
  neutral: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400 border-slate-500/20",
  premium: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border-violet-500/20",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-slate-500",
  premium: "bg-violet-500",
};

export function StatusBadge({ label, variant = "neutral", dot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold  tracking-wide border transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])} />
      )}
      {label}
    </span>
  );
}

// ── Helper mappers ──

export function getPaymentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    SETTLED: { label: "Settled", variant: "success" },
    PENDING: { label: "Pending", variant: "warning" },
    EXPIRED: { label: "Expired", variant: "neutral" },
    FAILED: { label: "Failed", variant: "error" },
  };
  return map[status] || { label: status, variant: "neutral" as BadgeVariant };
}

export function getRoleBadge(role: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    ADMINISTRATOR: { label: "Admin", variant: "premium" },
    SPEAKER: { label: "Speaker", variant: "info" },
    MODERATOR: { label: "Moderator", variant: "warning" },
    FINANCE: { label: "Finance", variant: "success" },
    PARTICIPANT: { label: "Participant", variant: "neutral" },
  };
  return map[role] || { label: role, variant: "neutral" as BadgeVariant };
}

export function getAccessTypeBadge(type: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    FREE: { label: "Free", variant: "success" },
    PAID: { label: "Paid", variant: "info" },

  };
  return map[type] || { label: type, variant: "neutral" as BadgeVariant };
}

export function getActiveBadge(isActive: boolean) {
  return isActive
    ? { label: "Active", variant: "success" as BadgeVariant }
    : { label: "Inactive", variant: "error" as BadgeVariant };
}
