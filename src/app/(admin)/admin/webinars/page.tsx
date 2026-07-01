// src/app/(admin)/admin/webinars/page.tsx
import prisma from "@/lib/prisma";
import { getWebinars } from "./actions";
import { WebinarsClient } from "./webinars-client";

export default async function WebinarsPage() {
  const webinars = await getWebinars();
  return <WebinarsClient webinars={webinars} />;
}
