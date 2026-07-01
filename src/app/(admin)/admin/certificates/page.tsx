import { getCertificates } from "@/actions/certificate";
import { CertificatesClient } from "./certificates-client";

export const metadata = {
  title: "Sertifikat — Admin Geomining.ID",
};

export default async function CertificatesPage() {
  const result = await getCertificates();

  // Pastikan data di pass ke client component meskipun kosong
  const certificates = result.data || [];

  // Data dikirimkan ke client sebagai any atau mapped type agar sesuai dengan props
  return <CertificatesClient certificates={certificates as any} />;
}
