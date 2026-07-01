// src/components/admin/stats-card.tsx
"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface StatsCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, className, iconClassName, ...props }: StatsCardProps) {
  return (
    <motion.div
      {...props}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 transition-colors duration-500 hover:border-primary/40 hover:bg-card/80",
        className
      )}
    >
      {/* Background ambient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Subtle top highlight for 3D effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative flex items-start justify-between z-10">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold  uppercase tracking-wider text-muted-foreground/80">
            {label}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-semibold text-foreground tracking-tight drop-shadow-sm">
              {typeof value === "number" ? value.toLocaleString("id-ID") : value}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={cn(
                    "flex items-center justify-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-background/50 backdrop-blur-sm border",
                    trend.value >= 0
                      ? "text-emerald-500 border-emerald-500/20"
                      : "text-rose-500 border-rose-500/20"
                  )}
                >
                  {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-[11px] text-muted-foreground/80 font-medium">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
            iconClassName
          )}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}
