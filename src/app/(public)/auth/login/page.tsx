import { LoginCard } from "./login-card";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] overflow-x-hidden transition-colors duration-300">
      
      {/* BACKGROUND: Motif Dot Pattern Minimalis */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Efek Pendaran Halus (Subtle Aura Glow) di Tengah Area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-blue-500/5 dark:bg-cyan-500/5 blur-[100px] pointer-events-none"></div>
      
      {/* Rendering Kontainer Login Card */}
      <main className="relative z-10 w-full flex justify-center items-center">
        <LoginCard />
      </main>
      
    </div>
  );
}