"use client";

import type { ReactNode } from "react";
import { hasAccess } from "@/lib/pricing";
import { useCase } from "@/lib/store";
import type { Entitlement } from "@/lib/types";
import { NeedsCase } from "./NeedsCase";
import { Card, LinkButton } from "./ui";

export function RequirePaid({ need, children }: { need: Entitlement; children: ReactNode }) {
  const { state } = useCase();
  return (
    <NeedsCase>
      {hasAccess(state.entitlement, need) ? (
        children
      ) : (
        <Card className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-2xl font-semibold">{need === "passport" ? "The Attorney Case Passport is part of the $129 plan" : "This is part of your Recovery Plan"}</h1>
          <p className="mt-2 text-ink-soft">Your free snapshot shows what we found. Unlock the full plan to see every step.</p>
          <div className="mt-5"><LinkButton href={need === "passport" && state.entitlement === "plan" ? "/dashboard" : "/plan"}>See options</LinkButton></div>
        </Card>
      )}
    </NeedsCase>
  );
}
