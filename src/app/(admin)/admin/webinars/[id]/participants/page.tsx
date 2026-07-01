import { notFound } from "next/navigation";
import { getWebinarParticipants, findWebinarById } from "@/repositories/webinar.repository";
import { ParticipantsClient } from "./participants-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webinar Participants | Admin",
  description: "Daftar peserta webinar",
};

export default async function WebinarParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const webinarId = resolvedParams.id;

  const webinar = await findWebinarById(webinarId);
  if (!webinar) {
    notFound();
  }

  const enrollments = await getWebinarParticipants(webinarId);
  
  // Transform enrollment data to participant data
  const participants = enrollments.map(e => ({
    id: e.user.id,
    name: e.user.name,
    email: e.user.email,
    createdAt: e.createdAt.toISOString(),
    profile: e.user.profile,
  }));

  return (
    <ParticipantsClient 
      participants={participants} 
      webinarTitle={webinar.title} 
      webinarId={webinar.id} 
    />
  );
}
