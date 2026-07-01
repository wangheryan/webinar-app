// src/app/(admin)/admin/dashboard-client.tsx
"use client";

import { Users, Video, CreditCard, DollarSign, Download, Settings2, MoreHorizontal, Eye, ArrowUpRight } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { getPaymentStatusBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency } from "@/lib/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DashboardStats } from "./actions";
import { motion, type Variants } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

// SVG Sparkline component untuk kompleksitas visual
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#gradient-${color})`}
      />
    </svg>
  );
};

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1);


  // Data dummy sparkline untuk mempercantik UI
  const sparklineData = [10, 25, 15, 40, 30, 50, 45, 70, 60, 85];

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── HEADER & ACTION CENTER ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight drop-shadow-sm flex items-center gap-2">
            {"Ringkasan Data"} <span className="text-primary/50">/</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{"Ikhtisar seluruh aktivitas platform"}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 px-4 gap-2 text-xs font-semibold rounded-xl border-border/60 bg-card/60 backdrop-blur-md shadow-3xs hidden sm:flex">
            <Settings2 size={14} /> {"Sesuaikan"}
          </Button>
          <Button size="sm" className="h-9 px-4 gap-2 text-xs font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5">
            <Download size={14} /> {"Unduh Laporan"}
          </Button>
        </div>
      </motion.div>

      {/* ── KPI CARDS DENGAN SPARKLINE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          variants={itemVariants}
          label={"Total Pengguna"}
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12.5, label: "vsLastMonth" }}
        />
        <StatsCard
          variants={itemVariants}
          label={"Total Webinar"}
          value={stats.totalWebinars}
          icon={Video}
          trend={{ value: 4.2, label: "vsLastMonth" }}
        />
        <StatsCard
          variants={itemVariants}
          label={"Total Pendaftaran"}
          value={stats.totalEnrollments}
          icon={CreditCard}
          trend={{ value: -2.4, label: "vsLastMonth" }}
        />
        <div className="relative group overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md p-6 shadow-sm hover:border-primary/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative flex items-start justify-between z-10">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">{"Total Pendapatan"}</p>
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="flex items-center justify-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">↑ 18.2%</span>
                  <span className="text-[11px] text-muted-foreground/80 font-medium">{"vs Bulan Lalu"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <DollarSign size={22} strokeWidth={2.5} />
            </div>
          </div>
          {/* Mock Sparkline Background */}
          <div className="absolute -bottom-2 -right-4 opacity-40 mix-blend-screen pointer-events-none">
            <Sparkline data={sparklineData} color="var(--color-primary)" />
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* REVENUE CHART (ADVANCED) */}
        <motion.div variants={itemVariants} className="lg:col-span-8 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">{"Grafik Pendapatan"}</h2>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{"Tren pendapatan bulanan"}</p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm border border-border/60 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-foreground flex items-center gap-2 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {"Data Langsung"}
            </div>
          </div>

          <div className="flex items-end gap-3 h-56 mt-auto relative z-10">
            {stats.monthlyRevenue.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm font-medium text-muted-foreground/60">{"Belum ada data pendapatan"}</div>
            ) : (
              stats.monthlyRevenue.map((m) => {
                const heightPercent = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">

                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 flex flex-col items-center">
                      <div className="bg-foreground text-background text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                        {formatCurrency(m.revenue)}
                      </div>
                      <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
                    </div>

                    <div className="w-full relative rounded-t-xl overflow-hidden bg-muted/20 border-x border-t border-border/30 group-hover:bg-muted/40 transition-colors" style={{ height: "100%" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 via-primary/90 to-primary rounded-t-xl shadow-[0_-5px_20px_rgba(var(--color-primary)/0.2)] group-hover:brightness-125 border-t border-white/20"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-wider">
                      {m.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* DISTRIBUTION & STATUS (RIGHT PANEL) */}
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground tracking-tight">{"Distribusi Pendaftaran"}</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{"Webinar paling diminati"}</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {stats.enrollmentsByStatus.length === 0 ? (
              <div className="text-center text-sm font-medium text-muted-foreground/60 py-10">{"Belum ada data distribusi"}</div>
            ) : (
              stats.enrollmentsByStatus.map((item) => {
                const total = stats.totalEnrollments || 1;
                const percentage = ((item.count / total) * 100).toFixed(1);
                const badge = getPaymentStatusBadge(item.status);

                // Color mapping for bars based on status
                let barColor = "from-slate-400 to-slate-500";
                if (item.status === "SETTLED" || item.status === "PAID") barColor = "from-emerald-400 to-emerald-500";
                if (item.status === "PENDING" || item.status === "UNPAID") barColor = "from-amber-400 to-amber-500";
                if (item.status === "FAILED" || item.status === "EXPIRED" || item.status === "CANCELLED") barColor = "from-rose-400 to-rose-500";

                return (
                  <div key={item.status} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <StatusBadge label={badge.label} variant={badge.variant} />
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-muted-foreground">{percentage}%</span>
                        <span className="text-[13px] font-bold text-foreground tracking-tight">{item.count}</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner group-hover:bg-muted transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-sm`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* ── ADVANCED TRANSACTIONS TABLE ── */}
      <motion.div variants={itemVariants} className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-muted/5">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">{"Transaksi Terakhir"}</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{"Pendaftaran webinar terbaru"}</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 px-3 text-[11px] font-semibold rounded-lg border-border/60 shadow-3xs hidden sm:flex items-center gap-1.5">
            {"Lihat Semua"} <ArrowUpRight size={14} />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-transparent border-b border-border/40">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-8">{"Peserta"}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-4">{"Program Webinar"}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-4">{"Status"}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-4">{"Metode Pembayaran"}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-4 text-right">{"Total Pembayaran"}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground h-12 px-6 text-right">{"Aksi"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <CreditCard size={24} className="opacity-40" />
                      <span className="text-[13px] font-medium">{"Belum ada transaksi terbaru"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentEnrollments.map((e) => {
                  const badge = getPaymentStatusBadge(e.status);
                  const userInitials = (e.userName || "U").substring(0, 2).toUpperCase();

                  return (
                    <TableRow key={e.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors duration-200 group">
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-semibold text-[11px] shadow-inner">
                            {userInitials}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground tracking-tight">{e.userName || "unknownUser"}</p>
                            <p className="text-[11px] text-muted-foreground/80 font-medium">{e.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[13px] font-semibold  text-foreground/90 max-w-[200px] truncate">
                        {e.webinarTitle}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                          <CreditCard size={12} className="text-foreground/60" />
                          {e.paymentChannel || "MANUAL"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[13px] font-bold text-foreground text-right tracking-tight drop-shadow-sm font-mono">
                        {formatCurrency(e.totalAmount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl bg-card/95 backdrop-blur-xl border-border/60">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">{"Tindakan"}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-[11px] font-semibold gap-2 cursor-pointer">
                              <Eye size={13} /> {"Rincian"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-semibold gap-2 cursor-pointer">
                              <Download size={13} /> {"Unduh Nota"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}
