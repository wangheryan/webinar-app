// src/app/(admin)/admin/enrollments/page.tsx
import { getEnrollments } from "./actions";
import { EnrollmentsClient } from "./enrollments-client";

export default async function EnrollmentsPage() {
  const enrollments = await getEnrollments();
  return <EnrollmentsClient enrollments={enrollments} />;
}
