"use client";

import type { ReactNode } from "react";
import { useCase } from "@/lib/store";
import { Card, LinkButton } from "./ui";

/** Renders children once local data is loaded; nudges to the check if nothing is there yet. */
export function NeedsCase({ children, need = "answers" }: { children: ReactNode; need?: "answers" | "none" }) {
  const { hydrated, state } = useCase();
  if (!hydrated) return <div className="py-24 text-center text-ink-mute">Loading…</div>;
  if (need === "answers" && !state.answers.state && state.ledger.length === 0) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-2xl font-semibold">Start with the free check</h2>
        <p className="mt-2 text-ink-soft">
          Nothing is saved yet on this device. Answer a few questions about what happened and we&apos;ll build this page for you.
        </p>
        <div className="mt-5">
          <LinkButton href="/check" size="lg">Check My Options — Free</LinkButton>
        </div>
      </Card>
    );
  }
  return <>{children}</>;
}
