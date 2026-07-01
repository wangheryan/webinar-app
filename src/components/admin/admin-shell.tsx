// src/components/admin/admin-shell.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebarInner } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

/**
 * AdminShell — Client component that co-locates sidebar collapsed state
 * with the main content area so both can react to the same state.
 * Includes mobile overlay sidebar support.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless mobileOpen */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebarInner
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          // Only apply margin on desktop
          collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
        )}
      >
        <AdminTopbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
