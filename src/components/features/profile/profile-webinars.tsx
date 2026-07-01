"use client";

import { Calendar, ArrowUpRight } from "lucide-react";


export function ProfileWebinars() {
  // Array data webinar tiruan, nanti tinggal dioper lewat props dari database
  const webinars = [
    { id: "1", title: "Webinar Kompetensi Geoteknik Tambang Terbuka", date: "24 Juni 2026", status: "Terdaftar" },
    { id: "2", title: "Aplikasi Machine Learning untuk Estimasi Sumberdaya", date: "12 Mei 2026", status: "Selesai" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#00d1ff] uppercase tracking-widest"> Registered_Events ({webinars.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {webinars.map((webinar) => (
          <div key={webinar.id} className="bg-[#131b2e]/40 border border-[#334155]/40 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-[#00d1ff]/50 transition-all group">
            <div className="space-y-2">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${webinar.status === "Terdaftar" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                {webinar.status}
              </span>
              <h4 className="text-sm font-semibold text-white group-hover:text-[#00d1ff] transition-colors">{webinar.title}</h4>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[#334155]/20 mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {webinar.date}
              </div>
              <button className="flex items-center gap-0.5 text-[#00d1ff] hover:underline cursor-pointer">
                Masuk <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}