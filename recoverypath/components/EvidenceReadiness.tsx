"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { REMEDIES } from "@/lib/content/remedies";
import { useCase } from "@/lib/store";
import type { EvidenceStatus } from "@/lib/types";
import { DocumentIndex } from "./DocumentIndex";
import { Explain } from "./Explain";
import { Card, LinkButton, Notice, PageHeader, Progress, cx } from "./ui";

export const STATUS_OPTIONS: { value: EvidenceStatus; label: string }[] = [
  { value: "have", label: "I have it" },
  { value: "requested", label: "Requested" },
  { value: "not_requested", label: "Not requested" },
  { value: "unavailable", label: "Unavailable" },
];

export function EvidenceReadinessView() {
  const { analysis, dispatch, state } = useCase();
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => track("evidence_started", { pathways: analysis.matches.length }, { once: true }), [analysis.matches.length]);

  if (!analysis.matches.length) {
    return (
      <Card className="text-center">
        <p>No pathways identified yet, so there&apos;s no evidence checklist to show.</p>
        <div className="mt-4"><LinkButton href="/loss">Add to My Ledger</LinkButton></div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Evidence Readiness" title="What can you prove?">
        This isn&apos;t your chance of winning. It shows how much of the evidence generally needed to evaluate or pursue each pathway you&apos;ve
        gathered so far.
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Overall evidence readiness</span>
            <span className="font-display text-3xl font-semibold tabular text-teal-700">{analysis.readiness.overall}%</span>
          </div>
          <div className="mt-3"><Progress value={analysis.readiness.overall} label="Overall evidence readiness" /></div>
        </Card>
        <Card>
          <div className="font-display text-3xl font-semibold tabular">{analysis.readiness.missing}</div>
          <div className="text-sm text-ink-mute">evidence items still missing</div>
        </Card>
      </div>

      <div className="space-y-6">
        {analysis.readiness.list.map((r) => (
          <Card key={r.remedyId}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">{REMEDIES[r.remedyId].shortName}</h2>
              <span className="text-sm text-ink-soft">Evidence readiness: <strong className="tabular text-ink">{r.percent}%</strong></span>
            </div>
            <div className="mt-2"><Progress value={r.percent} label={`${REMEDIES[r.remedyId].shortName} readiness`} /></div>

            <ul className="mt-5 divide-y divide-paper-line">
              {r.items.map((item) => {
                const isOpen = open === item.key;
                return (
                  <li key={item.key} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button className="flex items-center gap-2 text-left" onClick={() => setOpen(isOpen ? null : item.key)} aria-expanded={isOpen}>
                        <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm", item.status === "have" ? "bg-teal-600 text-white" : "border border-paper-line text-ink-mute")}>
                          {item.status === "have" ? "✓" : "○"}
                        </span>
                        <span className={cx("font-medium", item.status === "have" && "text-ink-soft")}>{item.label}</span>
                        {item.weight === 3 && <span className="text-xs font-semibold text-clay-600">Core</span>}
                      </button>
                      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={`Status of ${item.label}`}>
                        {STATUS_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            role="radio"
                            aria-checked={item.status === o.value}
                            onClick={() => dispatch({ type: "evidence", key: item.key, status: o.value })}
                            className={cx(
                              "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                              item.status === o.value ? "border-teal-600 bg-teal-600 text-white" : "border-paper-line text-ink-soft hover:border-teal-500",
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="ml-8 mt-3 grid gap-3 rounded-xl bg-paper p-4 text-sm sm:grid-cols-2">
                        <div>
                          <p className="font-semibold">Why it matters</p>
                          <p className="mt-1 text-ink-soft">{item.why}</p>
                          <p className="mt-2 text-xs text-ink-mute">Supports: {item.supports}</p>
                          <div className="mt-2"><Explain kind="why_evidence" remedyId={r.remedyId} evidenceId={item.id} /></div>
                        </div>
                        <div>
                          <p className="font-semibold">Where to obtain it</p>
                          <p className="mt-1 text-ink-soft">{item.where}</p>
                          <div className="mt-2"><Explain kind="where_document" remedyId={r.remedyId} evidenceId={item.id} /></div>
                          <p className="mt-2 text-xs text-ink-mute">
                            Documents filed under this item: {state.documents.filter((d) => d.category === item.key).length}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <DocumentIndex />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <LinkButton href="/plan" size="lg">Build My Recovery Plan</LinkButton>
        <Notice>How we score: core items count 3×, important 2×, helpful 1×. &ldquo;Requested&rdquo; counts as half.</Notice>
      </div>
    </div>
  );
}
