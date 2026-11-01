import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/pricing";
import { demoPaymentsEnabled, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const stripe = stripeClient();

  if (!stripe) {
    const plan = url.searchParams.get("plan") as PlanId;
    if (!demoPaymentsEnabled() || !(plan in PLANS)) return NextResponse.json({ paid: false }, { status: 400 });
    return NextResponse.json({ paid: true, plan, grants: PLANS[plan].grants, demo: true });
  }

  if (!sessionId) return NextResponse.json({ paid: false }, { status: 400 });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const plan = session.metadata?.plan as PlanId | undefined;
  if (session.payment_status !== "paid" || !plan || !(plan in PLANS)) return NextResponse.json({ paid: false });
  return NextResponse.json({ paid: true, plan, grants: PLANS[plan].grants });
}
