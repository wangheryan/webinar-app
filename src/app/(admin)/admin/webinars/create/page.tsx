import { getSpeakersForSelect } from "../actions";
import { WebinarForm } from "../_components/webinar-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create Webinar | Geomining Admin",
};

export default async function CreateWebinarPage() {
  // Fetch required data for the form
  const speakers = await getSpeakersForSelect();

  return (
    <div className="w-full pb-10">
      <div className="text-sm text-slate-500 mb-6 font-medium">
        <Link href="/admin/webinars" className="hover:text-slate-800 transition-colors">Webinars</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Create webinar</span>
      </div>
      <WebinarForm initialSpeakers={speakers} />
    </div>
  );
}
