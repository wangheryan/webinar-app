"use server";

import { redirect } from "next/navigation";
import { encryptToken } from "@/lib/crypto";

/**
 * 🚀 PRESENTATION LAYER (Next.js Server Action)
 * Menjembatani UI (Frontend) ke sistem Pembayaran.
 */

interface InitiateCheckoutPayload {
  webinarId: string;
  slug: string; 
  couponCode?: string | null;
  addonIds?: string[];
}

export async function initiateSecureCheckoutAction(payload: InitiateCheckoutPayload) {
  const { webinarId, slug, couponCode, addonIds = [] } = payload;

  const sessionData = JSON.stringify({
    webinarId, 
    coupon: couponCode || null,
    addons: addonIds,
    timestamp: Date.now() 
  });

  const secureToken = encryptToken(sessionData);

  redirect(`/payment/${slug}?session=${secureToken}`);
}
