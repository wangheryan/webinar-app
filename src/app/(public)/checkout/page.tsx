// src/app/(public)/checkout/page.tsx
"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth";
import { registerUser, verifyEmailOtp, resendEmailOtp } from "@/actions/auth";
import HeadMeta from "@/components/seo/head-meta";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";


import { CheckoutSkeleton } from "./checkout-skeleton";
import { CheckoutHeader } from "./checkout-header";
import { CheckoutAccountPanel } from "./checkout-account-panel";
import { CheckoutOrderPanel } from "./checkout-order-panel";

interface SpeakerData {
  name: string;
  title: string;
  company: string | null;
  image: string;
}

interface WebinarAddonData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
}

interface WebinarSessionData {
  id: string;
  title: string;
  startDate: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface WebinarData {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  abstract: string;
  category: string;
  imageUrl: string;
  basePrice: number;
  accessType: string;
  duration: string;
  isLive: boolean;
  slug: string;
  faqs: FaqItem[] | unknown;
  speakers: SpeakerData[];
  addons?: WebinarAddonData[];
  sessions?: WebinarSessionData[];
  _count: { enrollments: number };
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const webinarSlug = searchParams.get("webinar");


  const { data: session, status } = useSession();
  const currentUser = session?.user;

  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loadingWebinar, setLoadingWebinar] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // checkout states
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"VIRTUAL_ACCOUNT" | "QRIS">("QRIS");

  // coupon states
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // registration steps states
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // registration form
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      whatsapp: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");

  useEffect(() => {
    if (!webinarSlug) {
      setLoadingWebinar(false);
      return;
    }

    async function fetchWebinar() {
      try {
        const res = await fetch(`/api/webinars/${webinarSlug}`);
        if (!res.ok) {
          setErrorStatus(res.status);
          return;
        }
        const data = await res.json();
        setWebinar(data);
      } catch (err) {
        console.error("🚨 FETCH_WEBINAR_ERROR:", err);
        setErrorStatus(500);
      } finally {
        setLoadingWebinar(false);
      }
    }

    fetchWebinar();
  }, [webinarSlug]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const calculateBaseAndAddonsTotal = () => {
    if (!webinar) return 0;
    const addonsList = webinar.addons || [];
    const addonPrice = addonsList.filter(addon => selectedAddons.includes(addon.id)).reduce((sum, addon) => sum + addon.price, 0);
    return webinar.basePrice + addonPrice;
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          totalPurchase: calculateBaseAndAddonsTotal()
        })
      });

      const data = await res.json();

      if (res.ok) {
        setDiscountAmount(data.value);
        setAppliedCoupon(couponCode.toUpperCase());
      } else {
        setCouponError(data.error || "couponInvalid");
      }
    } catch {
      setCouponError("couponValidateFailed");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const finalTotalInvoice = Math.max(0, calculateBaseAndAddonsTotal() - discountAmount);

  // checkout submission logic
  const executeEnrollment = async (userEmail: string, userName: string) => {
    if (!webinar) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/enrollments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webinarId: webinar.id,
          addons: selectedAddons,
          totalAmount: finalTotalInvoice,
          paymentChannel: finalTotalInvoice === 0 ? "FREE_CHANNELS" : paymentMethod,
          isGuest: false,
          customerDetails: {
            name: userName,
            email: userEmail
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Pendaftaran gagal. Harap periksa kembali pesanan Anda.");
        return;
      }

      if (finalTotalInvoice === 0) {
        toast.success("Pendaftaran kelas gratis berhasil! Mengalihkan...");
        setTimeout(() => router.push("/profile"), 1500);
      } else {
        router.push(`/payment?id=${result.enrollmentId}`);
      }
    } catch (err) {
      console.error("CHECKOUT_SUBMISSION_ERROR:", err);
      toast.error("Terjadi kesalahan sistem saat memproses transaksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for authenticated user
  const handleLoggedInCheckout = () => {
    if (!currentUser) return;
    executeEnrollment(currentUser.email || "", currentUser.name || "");
  };

  // Submit for registration + checkout
  const onRegistrationSubmit = (data: RegisterInput) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    startTransition(async () => {
      const response = await registerUser(data);
      if (!response.success) {
        setGlobalError(response.message);
        return;
      }
      setRegisteredEmail(data.email);
      setIsOtpStep(true);
    });
  };

  const handleVerifyOtp = async (otpCode: string) => {
    const response = await verifyEmailOtp(registeredEmail, otpCode);

    if (response.success) {
      setGlobalSuccess("emailVerifiedEnrolling");
      setIsLoggingIn(true);

      // credentials login
      const loginResult = await signIn("credentials", {
        email: registeredEmail,
        password: watchedPassword,
        redirect: false,
      });

      if (loginResult?.error) {
        setIsLoggingIn(false);
        setGlobalError("autoLoginFailed");
        setTimeout(() => router.push("/auth/login"), 2500);
        return { success: true, message: "Terverifikasi tanpa auto-login." };
      }

      // Auto login success, trigger enrollment creation
      router.refresh();

      // wait a bit for NextAuth session to populate
      setTimeout(async () => {
        // eslint-disable-next-line react-hooks/incompatible-library
        await executeEnrollment(registeredEmail, watch("name"));
      }, 1000);
    }

    return response;
  };

  const handleResendOtp = async () => {
    return await resendEmailOtp(registeredEmail);
  };

  // ── Loading State ──
  if (status === "loading" || loadingWebinar) {
    return <CheckoutSkeleton />;
  }

  // ── Not Found / Error State ──
  if (!webinarSlug || errorStatus === 404 || !webinar) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-10 w-10 text-amber-500 animate-pulse mx-auto" />
        </div>
        <div className="space-y-2">
          <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">{"Webinar Tidak Ditemukan"}</h1>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            {"Program yang Anda cari tidak tersedia atau jadwalnya telah berlalu."}
          </p>
        </div>
        <Link
          href="/webinars"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/40 text-xs font-semibold text-foreground hover:text-primary transition-all duration-200 shadow-xs"
        >
          <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          {"Lihat Semua Program"}
        </Link>
      </div>
    );
  }

  // ── Main Checkout Page ──
  return (
    <>
      <HeadMeta
        title={`Checkout: ${webinar.title} | Geomining.ID`}
        description={`Daftarkan diri Anda untuk mengikuti masterclass ${webinar.title} di Geomining.ID.`}
        url={`https://geomining.id/checkout?webinar=${webinar.slug}`}
      />

      <main className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-foreground py-8 px-4 sm:px-6 lg:px-8 antialiased text-xs font-sans">
        <div className="max-w-5xl mx-auto space-y-6">

          <CheckoutHeader
            webinarTitle={webinar.title}
            webinarSlug={webinar.slug}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Panel: Account / Registration */}
            <div className="lg:col-span-7">
              <CheckoutAccountPanel
                currentUser={currentUser}
                webinarSlug={webinar.slug}
                isOtpStep={isOtpStep}
                registeredEmail={registeredEmail}
                globalError={globalError}
                globalSuccess={globalSuccess}
                isLoggingIn={isLoggingIn}
                isPending={isPending}
                isSubmitting={isSubmitting}
                errors={errors}
                register={register}
                onRegistrationSubmit={handleSubmit(onRegistrationSubmit)}
                onVerifyOtp={handleVerifyOtp}
                onResendOtp={handleResendOtp}
              />
            </div>

            {/* Right Panel: Order Configurator */}
            <div className="lg:col-span-5">
              <CheckoutOrderPanel
                webinar={webinar}
                currentUser={currentUser}
                selectedAddons={selectedAddons}
                toggleAddon={toggleAddon}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                discountAmount={discountAmount}
                isApplyingCoupon={isApplyingCoupon}
                couponError={couponError}
                appliedCoupon={appliedCoupon}
                handleApplyCoupon={handleApplyCoupon}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                finalTotalInvoice={finalTotalInvoice}
                formatCurrency={formatCurrency}
                isSubmitting={isSubmitting}
                handleLoggedInCheckout={handleLoggedInCheckout}
              />
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>{"Menyiapkan Formulir Pendaftaran..."}</span>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
