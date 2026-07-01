// src/app/(admin)/admin/coupons/page.tsx
import { getCoupons } from "./actions";
import { CouponsClient } from "./coupons-client";

export default async function CouponsPage() {
  const coupons = await getCoupons();
  return <CouponsClient coupons={coupons} />;
}
