// src/app/(public)/checkout/checkout-header.tsx
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";


interface CheckoutHeaderProps {
  webinarTitle: string;
  webinarSlug: string;
}

export function CheckoutHeader({ webinarTitle, webinarSlug }: CheckoutHeaderProps) {

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/webinars/${webinarSlug}`}
        className="group p-2.5 rounded-xl bg-card hover:bg-muted border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 shadow-xs"
      >
        <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShoppingCart size={12} />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight uppercase">
            {"Pendaftaran Webinar"}
          </h1>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{webinarTitle}</p>
      </div>
    </div>
  );
}
