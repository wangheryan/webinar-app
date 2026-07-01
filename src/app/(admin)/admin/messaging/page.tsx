import { Metadata } from "next";
import MessagingClient from "./messaging-client";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Perpesanan | Admin Panel",
  description: "Kirim pesan kepada pengguna dan peserta webinar",
};

export default async function MessagingPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMINISTRATOR") {
    redirect("/auth/login");
  }

  return <MessagingClient />;
}
