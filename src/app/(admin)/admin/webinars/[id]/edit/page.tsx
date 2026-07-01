import { getWebinarById, getSpeakersForSelect } from "../../actions";
import { WebinarForm } from "../../_components/webinar-form";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Webinar | Geomining Admin",
};

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Fetch required data in parallel
  const [webinar, speakers] = await Promise.all([
    getWebinarById(id),
    getSpeakersForSelect()
  ]);

  if (!webinar) {
    notFound();
  }

  return (
    <div className="w-full pb-10">
      <div className="text-sm text-slate-500 mb-6 font-medium">
        <Link href="/admin/webinars" className="hover:text-slate-800 transition-colors">Webinars</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Edit webinar</span>
      </div>
      <WebinarForm initialSpeakers={speakers} initialData={webinar} />
    </div>
  );
}
