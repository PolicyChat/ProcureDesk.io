import Stripe from "stripe";

export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function demoPaymentsEnabled() {
  return !process.env.STRIPE_SECRET_KEY && process.env.DEMO_PAYMENTS !== "false";
}

export function appUrl(req: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}
