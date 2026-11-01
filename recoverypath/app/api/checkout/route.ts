import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/pricing";
import { appUrl, demoPaymentsEnabled, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = body?.plan as PlanId;
  if (!(plan in PLANS)) return NextResponse.json({ error: "unknown plan" }, { status: 400 });

  const base = appUrl(req);
  const stripe = stripeClient();

  if (!stripe) {
    if (!demoPaymentsEnabled()) return NextResponse.json({ error: "payments not configured" }, { status: 503 });
    return NextResponse.json({ url: `${base}/checkout/success?demo=1&plan=${plan}`, demo: true });
  }

  const p = PLANS[plan];
  // Neutral statement descriptor & product name: card statements and receipts
  // can be seen by an abusive partner.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: p.price * 100,
          product_data: { name: "RP Planning Report" },
        },
      },
    ],
    metadata: { plan },
    payment_intent_data: { statement_descriptor_suffix: "RP REPORT" },
    success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/plan?canceled=1`,
  });
  return NextResponse.json({ url: session.url });
}
