"use client";

import { REMEDIES } from "@/lib/content/remedies";
import { MODULE_BY_ID, STATE_NAMES } from "@/lib/content/states";
import { formatUSD, moduleStateFor } from "@/lib/engine";
import { useCase } from "@/lib/store";
import type { RemedyMatch } from "@/lib/types";
import { ContentStatusBanner } from "./ContentStatusBanner";
import { Explain } from "./Explain";
import { SourceList } from "./SourceList";
import { Badge, Card, LinkButton, PageHeader } from "./ui";

const STRENGTH_COPY: Record<RemedyMatch["strength"], { label: string; tone: "teal" | "gold" | "gray" }> = {
  strong: { label: "Several relevant facts", tone: "teal" },
  possible: { label: "Some relevant facts", tone: "gold" },
  needs_info: { label: "More information needed", tone: "gray" },
};

const TERMS: Record<string, string[]> = {
  coerced_debt: ["coerced debt", "identity theft report", "debt validation"],
  contribution_recovery: ["unjust enrichment", "constructive trust", "statute of limitations"],
  shared_obligation: ["co-borrower", "small claims court"],
  romance_scam: ["chargeback"],
};

export function RemedyResults() {
  const { analysis, state } = useCase();
  const st = moduleStateFor(state.answers.state);
  const matches = analysis.matches;

  return (
    <div>
      <PageHeader eyebrow={`Remedy Match · ${STATE_NAMES[st]}`} title={matches.length ? `${matches.length} potential pathway${matches.length === 1 ? "" : "s"} identified` : "No pathway identified yet"}>
        {matches.length
          ? "Each pathway appeared because specific facts you gave us match what our state rules screen for. This isn't a finding that you have a claim."
          : "Try adding to your financial ledger or revisiting the check — many pathways depend on details like whose name an account is in."}
      </PageHeader>

      <ContentStatusBanner statuses={matches.map((m) => m.moduleStatus)} />

      <div className="space-y-6">
        {matches.map((m) => {
          const mod = MODULE_BY_ID[m.moduleId];
          const remedy = REMEDIES[m.remedyId];
          const s = STRENGTH_COPY[m.strength];
          return (
            <Card key={m.remedyId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-teal-600">Potential pathway identified</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{mod.title}</h2>
                  <p className="mt-1 text-sm text-ink-mute">{remedy.userLabel}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {m.urgency.some((u) => u.level === "urgent") && <Badge tone="clay">Time-sensitive</Badge>}
                  <Badge tone={s.tone}>{s.label}</Badge>
                  {m.linkedAmount > 0 && <Badge>{formatUSD(m.linkedAmount)} linked</Badge>}
                </div>
              </div>

              {m.urgency.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {m.urgency.map((u) => (
                    <li key={u.label} className={`rounded-xl px-3 py-2 text-sm ${u.level === "urgent" ? "bg-clay-50 text-clay-600" : "bg-gold-50 text-ink-soft"}`}>
                      <strong>{u.level === "urgent" ? "Urgent: " : "Soon: "}</strong>
                      {u.label}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 leading-relaxed text-ink-soft">{remedy.summary}</p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Why it appeared</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                    {m.why.map((w) => (
                      <li key={w} className="flex gap-2"><span className="text-teal-600">✓</span>{w}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Information still needed</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                    {m.infoNeeded.map((w) => (
                      <li key={w} className="flex gap-2"><span className="text-ink-mute">○</span>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-paper p-4">
                <h3 className="text-sm font-semibold">What&apos;s specific to {STATE_NAMES[st]}</h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                  {mod.stateNotes.map((n) => <li key={n}>{n}</li>)}
                </ul>
                {mod.requirements.length > 0 && (
                  <>
                    <h4 className="mt-3 text-sm font-semibold">What this procedure generally asks for</h4>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                      {mod.requirements.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <Explain kind="why_remedy" remedyId={m.remedyId} />
                {TERMS[m.remedyId]?.map((t) => <Explain key={t} kind="term" term={t} label={`What does "${t}" mean?`} />)}
              </div>

              <details className="mt-5 border-t border-paper-line pt-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink-soft">Sources, agencies and rule details</summary>
                <div className="mt-3 space-y-4">
                  <SourceList sources={[...remedy.baseSources, ...mod.sources]} agencies={[...remedy.baseAgencies, ...mod.agencies]} />
                  <p className="text-xs text-ink-mute">
                    Rule {mod.id} · version {mod.version} · status: {mod.status.replace("_", " ")} · {mod.reviewedBy ? `reviewed by ${mod.reviewedBy}` : "not yet attorney reviewed"}
                    {mod.lastVerified ? ` · last verified ${mod.lastVerified}` : ""}
                  </p>
                </div>
              </details>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {matches.length > 0 ? (
          <LinkButton href="/evidence" size="lg">Check What Evidence I Need</LinkButton>
        ) : (
          <LinkButton href="/loss" size="lg">Add to My Ledger</LinkButton>
        )}
        <LinkButton href="/check" variant="ghost">Revisit my answers</LinkButton>
      </div>
    </div>
  );
}
