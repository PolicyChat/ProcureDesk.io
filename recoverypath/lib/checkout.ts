"use client";

import { track } from "./analytics";
import type { PlanId } from "./pricing";

export async function startCheckout(plan: PlanId) {
  track("checkout_started", { plan });
  const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
  const data = await res.json().catch(() => ({}));
  if (data.url) window.location.assign(data.url);
  else alert("Checkout isn't available right now. Please try again shortly.");
}
