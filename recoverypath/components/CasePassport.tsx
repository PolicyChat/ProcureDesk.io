"use client";

import { useMemo, useState } from "react";
import { formatUSD } from "@/lib/engine";
import { buildPassport } from "@/lib/passport";
import { useCase } from "@/lib/store";
import { Button, Card } from "./ui";

export function CasePassport() {
  const { state, analysis } = useCase();
  const p = useMemo(() => buildPassport(state, analysis), [state, analysis]);
  const [consent, setConsent] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function polish() {
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "passport_summary",
          answers: state.answers,
          ledger: state.ledger.map(({ category, amount, date, evidence }) => ({ category, amount, date, evidence })),
        }),
      });
      const d = await res.json();
      setSummary(d.text || null);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "case-passport.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const h = p.header;
  const rows: [string, string | number][] = [
    ["Financial impact", formatUSD(h.financialImpact)],
    ["State", h.state],
    ["Relationship", h.relationship],
    ["Status", h.relationshipStatus],
    ["Potential pathways", h.potentialPathways],
    ["Transactions", h.transactions],
    ["Documents", h.documents],
    ["Timeline", h.timeline],
    ["Evidence readiness", `${h.evidenceReadiness}%`],
    ["Urgent issues", h.urgentIssues],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="no-print mb-6 bg-teal-50/50">
        <h2 className="font-semibold">Before you share this packet</h2>
        <p className="mt-1 text-sm text-ink-soft">
          It contains sensitive details about your finances and relationship. RecoveryPath never sends it to anyone — you decide who receives
          it. Only share it with an attorney or advocate you trust, and don&apos;t send it from an account your former partner can access.
        </p>
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 accent-teal-600" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I understand, and I choose who receives this packet.
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={!consent} onClick={() => window.print()}>Print or save as PDF</Button>
          <Button variant="secondary" disabled={!consent} onClick={download}>Download data file (JSON)</Button>
        </div>
      </Card>

      <article className="rounded-2xl bg-white p-6 sm:p-10 print:p-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Attorney Case Passport</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Relationship financial harm — intake summary</h1>
        <p className="mt-1 text-xs text-ink-mute">{p.format} · generated {new Date(p.generatedAt).toLocaleString("en-US")}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-paper-line p-4 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-paper-line py-1 last:border-0">
              <dt className="text-ink-mute">{k}</dt>
              <dd className="tabular text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Factual summary</h2>
            <button className="no-print text-sm font-semibold text-teal-700 hover:underline" onClick={polish} disabled={loading}>
              {loading ? "Writing…" : summary ? "Rewrite" : "Improve readability"}
            </button>
          </div>
          <p className="mt-2 leading-relaxed text-ink-soft">{summary || p.factualSummary}</p>
          {summary && <p className="mt-1 text-xs text-ink-mute">Rewritten for readability from the structured facts below; check it before sharing.</p>}
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Chronology &amp; transaction ledger</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-ink-mute">
              <tr><th className="py-1">Date</th><th>Item</th><th className="text-right">Amount</th><th className="pl-3">Evidence</th><th className="pl-3">Status</th></tr>
            </thead>
            <tbody>
              {p.transactions.map((t, i) => (
                <tr key={i} className="border-t border-paper-line">
                  <td className="py-1.5 tabular">{t.date ?? "—"}</td>
                  <td>{t.description || t.category}<div className="text-xs text-ink-mute">{t.category}</div></td>
                  <td className="text-right tabular">{formatUSD(t.amount)}</td>
                  <td className="pl-3 capitalize">{t.evidenceStrength}</td>
                  <td className="pl-3">{t.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Potential pathways (screening only)</h2>
          {p.pathways.map((pw) => (
            <div key={pw.rule.id} className="mt-4 rounded-xl border border-paper-line p-4 text-sm">
              <p className="font-semibold">{pw.pathway}</p>
              <p className="text-xs text-ink-mute">Rule {pw.rule.id} v{pw.rule.version} ({pw.rule.status}) · {formatUSD(pw.amountIdentified)} identified · evidence readiness {pw.evidenceReadiness}%</p>
              <p className="mt-2 font-medium">Facts reported</p>
              <ul className="list-disc pl-5 text-ink-soft">{pw.factsSupporting.map((f) => <li key={f}>{f}</li>)}</ul>
              {pw.urgency.length > 0 && (<><p className="mt-2 font-medium">Urgent / time-sensitive</p><ul className="list-disc pl-5 text-ink-soft">{pw.urgency.map((f) => <li key={f}>{f}</li>)}</ul></>)}
              <p className="mt-2 font-medium">Evidence gaps</p>
              <ul className="list-disc pl-5 text-ink-soft">{pw.evidenceGaps.map((g) => <li key={g.item}>{g.item} <span className="text-ink-mute">({g.status.replace("_", " ")})</span></li>)}</ul>
              <p className="mt-2 font-medium">Questions requiring legal analysis</p>
              <ul className="list-disc pl-5 text-ink-soft">{[...pw.openQuestions, ...pw.questionsForAttorney].map((q) => <li key={q}>{q}</li>)}</ul>
              {pw.sources.length > 0 && <p className="mt-2 text-xs text-ink-mute">Sources referenced: {pw.sources.join("; ")}</p>}
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Document index</h2>
          {p.documents.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm">{p.documents.map((d, i) => <li key={i}>{d.name} <span className="text-ink-mute">— {d.category}</span></li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-ink-mute">No documents indexed yet.</p>
          )}
        </section>

        <section className="mt-8 print-break">
          <h2 className="font-display text-xl font-semibold">Client intake answers</h2>
          <dl className="mt-2 space-y-1.5 text-sm">
            {p.intake.map((x) => <div key={x.question}><dt className="text-ink-mute">{x.question}</dt><dd>{x.answer}</dd></div>)}
          </dl>
        </section>

        <p className="mt-10 text-xs text-ink-mute">{p.disclaimer}</p>
      </article>
    </div>
  );
}
