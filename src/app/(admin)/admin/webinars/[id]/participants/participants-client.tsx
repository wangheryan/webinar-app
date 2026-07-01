"use client";

import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime as formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";

type Participant = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  profile: {
    institution: string | null;
    employmentStatus: string;
  } | null;
};



export function ParticipantsClient({
  participants,
  webinarTitle,
  webinarId,
}: {
  participants: Participant[];
  webinarTitle: string;
  webinarId: string;
}) {
  const columns: Column<Participant>[] = [
    {
      key: ")name",
      label: "Participant Name",
      render: (p) => (
        <div className="min-w-[180px]">
          <p className="text-[12px] font-semibold  text-foreground">{p.name || "-"}</p>
          <p className="text-[10.5px] text-muted-foreground">{p.email}</p>
        </div>
      ),
    },
    {
      key: "employment",
      label: "Status",
      render: (p) => (
        <StatusBadge
          label={p.profile?.employmentStatus || "GENERAL"}
          variant={
            p.profile?.employmentStatus === "MAHASISWA" ? "warning" :
              p.profile?.employmentStatus === "PROFESSIONAL" ? "success" : "neutral"
          }
          dot={false}
        />
      ),
    },
    {
      key: "institution",
      label: "Institution / Company",
      render: (p) => (
        <p className="text-[11px] text-muted-foreground max-w-[200px] truncate">
          {p.profile?.institution || "-"}
        </p>
      ),
    },
    {
      key: "date",
      label: "Registered At",
      className: "text-right",
      render: (p) => (
        <span className="text-[11px] text-muted-foreground">{formatDate(p.createdAt)}</span>
      ),
    },
  ];

  const handleExport = () => {
    // Generate CSV
    const headers = ["Name", "Email", "Employment Status", "Institution", "Registered At"];
    const rows = participants.map(p => [
      p.name || "-",
      p.email || "-",
      p.profile?.employmentStatus || "GENERAL",
      p.profile?.institution || "-",
      p.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants_${webinarId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/webinars">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft size={14} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Webinar Participants</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {participants.length} enrolled in <span className="font-medium text-foreground">{webinarTitle}</span>
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={participants}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari nama peserta..."
        actions={
          <Button
            variant="outline"
            className="h-9 gap-2 text-[12px] font-semibold  rounded-xl"
            onClick={handleExport}
            disabled={participants.length === 0}
          >
            <Download size={14} /> Export CSV
          </Button>
        }
      />
    </div>
  );
}
