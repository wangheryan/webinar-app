import { getSpeakersPool } from "@/actions/speaker";
import { InstructorsClient } from "./instructors-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Instruktur — Admin Geomining.ID",
};

export default async function InstructorsPage() {
  const result = await getSpeakersPool();

  if (!result.success) {
    // Bisa handle error state atau render empty state, untuk sementara kita lewatkan saja.
  }

  const instructors = result.data || [];

  return <InstructorsClient instructors={instructors} />;
}
