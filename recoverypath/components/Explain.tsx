"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import type { ExplainKind } from "@/lib/explain";
import { useCase } from "@/lib/store";
import type { RemedyId } from "@/lib/types";

const LABELS: Record<ExplainKind, string> = {
  why_remedy: "Why did this remedy appear?",
  why_evidence: "Why do I need this evidence?",
  where_document: "Where do I get this document?",
  term: "What does this term mean?",
  next_step: "What should I do next?",
  passport_summary: "Write a plain-language summary",
};

/**
 * One controlled question. There is deliberately no free-text "ask anything" box.
 */
export function Explain({
  kind,
  remedyId,
  evidenceId,
  term,
  action,
  label,
}: {
  kind: ExplainKind;
  remedyId?: RemedyId;
  evidenceId?: string;
  term?: string;
  action?: { title: string; detail: string };
  label?: string;
}) {
  const { state } = useCase();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (open) return setOpen(false);
    setOpen(true);
    if (text) return;
    setLoading(true);
    track("explanation_requested", { kind });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          remedyId,
          evidenceId,
          term,
          action,
          answers: state.answers,
          ledger: state.ledger.map(({ category, amount, date, evidence }) => ({ category, amount, date, evidence })),
        }),
      });
      const data = await res.json();
      setText(data.text || "We couldn't load an explanation right now.");
    } catch {
      setText("We couldn't load an explanation right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="no-print">
      <button onClick={ask} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline" aria-expanded={open}>
        <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-teal-50 text-xs">?</span>
        {label ?? LABELS[kind]}
      </button>
      {open && (
        <div className="mt-2 whitespace-pre-line rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-sm leading-relaxed text-ink-soft" aria-live="polite">
          {loading ? "Loading explanation…" : text}
          {!loading && <p className="mt-2 text-xs text-ink-mute">General information from RecoveryPath&apos;s content library — not legal advice.</p>}
        </div>
      )}
    </div>
  );
}
