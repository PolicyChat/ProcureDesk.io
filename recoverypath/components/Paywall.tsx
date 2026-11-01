"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { startCheckout } from "@/lib/checkout";
import { formatUSD, BUCKET_LABELS } from "@/lib/engine";
import { PLANS, type PlanId } from "@/lib/pricing";
import { useCase } from "@/lib/store";
import { Button, Card, Notice, Stat } from "./ui";

export function Paywall({ canceled }: { canceled: boolean }) {
  const { analysis, state } = useCase();
  const router = useRouter();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const s = analysis.snapshot;

  useEffect(() => {
    if (state.entitlement !== "free") router.replace("/dashboard");
    else track("paywall_viewed", { pathways: s.pathways }, { once: true });
  }, [state.entitlement, router, s.pathways]);

  async function buy(plan: PlanId) {
    setBusy(plan);
    await startCheckout(plan);
    setBusy(null);
  }

  const first = analysis.plan[0];

  return (
    <div>
      {canceled && <div className="mb-6"><Notice>Checkout was canceled — nothing was charged. Your results are still here.</Notice></div>}

      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Your Financial Recovery Snapshot</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Here&apos;s what we&apos;ve put together for you</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1"><Stat value={formatUSD(s.impact)} label="financial impact identified" /></div>
        <Stat value={s.pathways} label="potential pathways identified" tone="teal" />
        <Stat value={`${s.readiness}%`} label="evidence readiness" tone="teal" />
        <Stat value={s.missingEvidence} label="missing evidence items" tone="clay" />
        <Stat value={s.actions} label="recommended next actions" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-lg leading-relaxed text-ink-soft">
            Your complete Recovery Plan explains each pathway, what documentation you still need, where to take action and when professional
            review is recommended.
          </p>

          <Card className="relative mt-6 overflow-hidden">
            <h2 className="font-semibold">My Recovery Plan</h2>
            {first && (
              <div className="mt-3 rounded-xl bg-teal-50 p-3">
                <p className="text-xs font-semibold uppercase text-teal-700">{BUCKET_LABELS[first.bucket]}</p>
                <p className="mt-0.5 font-medium">{first.title}</p>
              </div>
            )}
            <div aria-hidden="true" className="mt-3 space-y-3 blur-[5px] select-none">
              {analysis.plan.slice(1, 6).map((a) => (
                <div key={a.id} className="rounded-xl bg-paper p-3">
                  <p className="text-xs font-semibold uppercase text-ink-mute">{BUCKET_LABELS[a.bucket]}</p>
                  <p className="mt-0.5">{a.title.replace(/[A-Za-z0-9]/g, "x")}</p>
                </div>
              ))}
            </div>
            {analysis.plan.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-16 text-center text-sm font-semibold text-ink-soft">
                {analysis.plan.length - 1} more actions in your plan
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-teal-500 ring-1 ring-teal-500">
            <h2 className="font-display text-xl font-semibold">{PLANS.plan.name}</h2>
            <p className="mt-1 text-sm text-ink-soft">{PLANS.plan.blurb}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              {[
                "Your full, ordered action plan",
                "Why each pathway was identified",
                "State-specific requirements & official sources",
                "Evidence you have and what's missing",
                "Questions to ask an attorney",
                "Free assistance options",
                "Printable Claim Readiness Report",
              ].map((x) => <li key={x}>✓ {x}</li>)}
            </ul>
            <Button size="lg" className="mt-4 w-full" onClick={() => buy("plan")} disabled={!!busy}>
              {busy === "plan" ? "Opening checkout…" : `Unlock My Recovery Plan — $${PLANS.plan.price}`}
            </Button>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">{PLANS.passport.name}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Everything above, plus a one-page factual summary, chronology, transaction ledger, document index and evidence gaps — organized
              the way attorneys need it.
            </p>
            <Button variant="secondary" size="lg" className="mt-4 w-full" onClick={() => buy("passport")} disabled={!!busy}>
              {busy === "passport" ? "Opening checkout…" : `Get Plan + Attorney Packet — $${PLANS.passport.price}`}
            </Button>
          </Card>
          <p className="text-xs leading-relaxed text-ink-mute">
            One-time payment. Your card statement will show a neutral description. This is a self-help organization tool, not legal advice,
            and it doesn&apos;t guarantee any recovery.
          </p>
        </div>
      </div>
    </div>
  );
}
