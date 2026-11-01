"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { ENTRY_POINTS } from "@/lib/content/assessment";
import { useCase } from "@/lib/store";

export function LandingTracker() {
  useEffect(() => track("landing_view", {}, { once: true }), []);
  return null;
}

export function EntryChips() {
  const { dispatch } = useCase();
  const router = useRouter();
  return (
    <ul className="mt-4 space-y-2">
      {ENTRY_POINTS.map((e) => (
        <li key={e.id}>
          <button
            onClick={() => {
              dispatch({ type: "preset", answers: e.preset });
              track("assessment_started", { source: e.id });
              router.push(`/check?from=${e.id}`);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-paper-line bg-paper px-4 py-3 text-left font-medium text-ink transition hover:border-teal-500 hover:bg-teal-50"
          >
            {e.label}
            <span aria-hidden="true" className="text-teal-600">→</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
