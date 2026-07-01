import { Navbar } from "@/components/layout/navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex flex-col pt-[104px]">
        {children}
      </main>
    </>
  );
}
