"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { RANK } from "@/lib/pricing";
import { useCase } from "@/lib/store";
import type { Entitlement } from "@/lib/types";
import { Card, LinkButton } from "./ui";

export function CheckoutSuccess({ sessionId, plan }: { sessionId?: string; plan?: string }) {
  const { dispatch, hydrated, state } = useCase();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "failed">("checking");

  useEffect(() => {
    if (!hydrated) return;
    const qs = sessionId ? `session_id=${encodeURIComponent(sessionId)}` : `plan=${encodeURIComponent(plan ?? "")}`;
    fetch(`/api/checkout/verify?${qs}`)
      .then((r) => r.json())
      .then((d: { paid: boolean; grants?: Entitlement; plan?: string }) => {
        if (!d.paid || !d.grants) return setStatus("failed");
        if (RANK[d.grants] > RANK[state.entitlement]) dispatch({ type: "entitlement", value: d.grants });
        track(d.grants === "passport" ? "packet_purchased" : "report_purchased", { plan: d.plan });
        router.replace("/dashboard");
      })
      .catch(() => setStatus("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <Card className="mx-auto max-w-lg text-center">
      {status === "checking" ? (
        <p className="py-6 text-ink-soft">Confirming your purchase…</p>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">We couldn&apos;t confirm the payment</h1>
          <p className="mt-2 text-ink-soft">If you were charged, your receipt email has a reference number. Please contact support with it.</p>
          <div className="mt-4"><LinkButton href="/plan">Back to my snapshot</LinkButton></div>
        </>
      )}
    </Card>
  );
}
