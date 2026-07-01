// src/components/features/webinar-grid/webinar-grid-list.tsx
import prisma from "@/lib/prisma"; 
import WebinarGridListClient from "./webinar-grid-list-client";

interface WebinarGridListProps {
  searchParams: Promise<{ category?: string; type?: string }>;
}

export default async function WebinarGridList({ searchParams }: WebinarGridListProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "ALL";
  const activeType = resolvedParams.type || "ALL";

  const [webinars, uniqueCategories] = await Promise.all([
    prisma.webinar.findMany({ 
      include: { 
        sessions: { select: { startDate: true } }, 
        addons: { select: { id: true } } 
      }, 
      orderBy: { createdAt: "desc" } 
    }),
    prisma.webinar.findMany({ select: { category: true }, distinct: ["category"] }),
  ]);

  const categoriesList = ["ALL", ...uniqueCategories.map((w) => w.category)];

  // Serialize Date objects before passing them to the Client Component
  const serializedWebinars = webinars.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    sessions: w.sessions.map((s) => ({
      ...s,
      startDate: s.startDate.toISOString(),
    })),
  }));

  return (
    <WebinarGridListClient
      initialWebinars={serializedWebinars}
      categoriesList={categoriesList}
      initialCategory={activeCategory}
      initialType={activeType}
    />
  );
}