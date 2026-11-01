"use client";

import { LEDGER_CATEGORIES, REMEDIES } from "@/lib/content/remedies";
import { MODULE_BY_ID, STATE_NAMES } from "@/lib/content/states";
import { BUCKET_LABELS, formatUSD, moduleStateFor } from "@/lib/engine";
import { useCase } from "@/lib/store";
import { SourceList } from "./SourceList";
import { Button } from "./ui";

function H({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 border-b border-paper-line pb-2 font-display text-xl font-semibold">
      <span className="mr-2 text-teal-600 tabular">{n}.</span>
      {children}
    </h2>
  );
}

export function RecoveryReport() {
  const { analysis, state } = useCase();
  const st = moduleStateFor(state.answers.state);
  const cat = Object.fromEntries(LEDGER_CATEGORIES.map((c) => [c.id, c.label]));
  const have = analysis.readiness.list.flatMap((r) => r.items.filter((i) => i.status === "have").map((i) => ({ ...i, r: r.remedyId })));
  const missing = analysis.readiness.list.flatMap((r) => r.items.filter((i) => i.status !== "have").map((i) => ({ ...i, r: r.remedyId })));

  return (
    <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-10 print:p-0">
      <div className="no-print mb-6 flex justify-end"><Button onClick={() => window.print()}>Print or save as PDF</Button></div>
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Claim Readiness Report</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your Recovery Plan</h1>
      <p className="mt-1 text-sm text-ink-mute">
        {STATE_NAMES[st]} · prepared {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
      </p>
      <p className="mt-4 rounded-xl bg-paper p-3 text-xs leading-relaxed text-ink-soft">
        This report organizes information you provided. It is not legal advice, is not a finding that you have a claim, and does not predict or
        guarantee any recovery. Some screening rules are still in legal review.
      </p>

      <H n={1}>Your financial impact</H>
      <p className="font-display text-3xl font-semibold tabular">{formatUSD(analysis.loss.total)}</p>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {state.ledger.map((e) => (
            <tr key={e.id} className="border-b border-paper-line">
              <td className="py-1.5">{e.description || cat[e.category]}<span className="text-ink-mute"> · {cat[e.category]}</span></td>
              <td className="py-1.5 text-right tabular">{formatUSD(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H n={2}>Potential remedy pathways</H>
      <ul className="list-disc space-y-1 pl-5">
        {analysis.matches.map((m) => <li key={m.remedyId}><strong>{MODULE_BY_ID[m.moduleId].title}</strong>{m.linkedAmount ? ` — ${formatUSD(m.linkedAmount)} linked` : ""}</li>)}
      </ul>

      <H n={3}>Why each was identified</H>
      {analysis.matches.map((m) => (
        <div key={m.remedyId} className="mb-4">
          <p className="font-semibold">{REMEDIES[m.remedyId].shortName}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-ink-soft">{m.why.map((w) => <li key={w}>{w}</li>)}</ul>
          {m.infoNeeded.length > 0 && <p className="mt-1 text-sm text-ink-mute">Still needed: {m.infoNeeded.join("; ")}.</p>}
        </div>
      ))}

      <H n={4}>State-specific requirements</H>
      {analysis.matches.map((m) => {
        const mod = MODULE_BY_ID[m.moduleId];
        return (
          <div key={m.remedyId} className="mb-4 text-sm">
            <p className="font-semibold">{mod.title}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-soft">
              {[...mod.stateNotes, ...mod.requirements].map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="mt-2 font-medium">General procedure</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-ink-soft">{mod.procedure.map((x) => <li key={x}>{x}</li>)}</ol>
          </div>
        );
      })}

      <H n={5}>Evidence you have</H>
      {have.length ? <ul className="list-disc pl-5 text-sm">{have.map((i) => <li key={i.key}>{i.label} <span className="text-ink-mute">({REMEDIES[i.r].shortName})</span></li>)}</ul> : <p className="text-sm text-ink-mute">None marked yet.</p>}

      <H n={6}>Evidence missing</H>
      <ul className="space-y-2 text-sm">
        {missing.map((i) => (
          <li key={i.key}>
            <strong>{i.label}</strong> <span className="text-ink-mute">— {i.status.replace("_", " ")} · {REMEDIES[i.r].shortName}</span>
            <br /><span className="text-ink-soft">Where: {i.where}</span>
          </li>
        ))}
      </ul>

      <H n={7}>Action sequence</H>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        {analysis.plan.map((a) => <li key={a.id}><span className="text-xs font-semibold uppercase text-teal-700">{BUCKET_LABELS[a.bucket]}</span> — <strong>{a.title}</strong><br /><span className="text-ink-soft">{a.detail}</span></li>)}
      </ol>

      <H n={8}>Official sources, forms and agencies</H>
      <div className="space-y-5">
        {analysis.matches.map((m) => {
          const mod = MODULE_BY_ID[m.moduleId];
          const r = REMEDIES[m.remedyId];
          return (
            <div key={m.remedyId}>
              <p className="mb-2 text-sm font-semibold">{r.shortName}</p>
              <SourceList sources={[...r.baseSources, ...mod.sources]} agencies={[...r.baseAgencies, ...mod.agencies]} />
            </div>
          );
        })}
      </div>

      <H n={9}>Questions requiring attorney review</H>
      {analysis.matches.map((m) => (
        <div key={m.remedyId} className="mb-3 text-sm">
          <p className="font-semibold">{REMEDIES[m.remedyId].shortName}</p>
          <ul className="mt-1 list-disc pl-5 text-ink-soft">{REMEDIES[m.remedyId].attorneyQuestions.map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      ))}

      <H n={10}>Free assistance</H>
      <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
        <li>LawHelp.org — find free and low-cost legal aid in your state (https://www.lawhelp.org)</li>
        <li>National Domestic Violence Hotline — 1-800-799-7233, text START to 88788 (https://www.thehotline.org)</li>
        <li>CFPB — complaints about creditors, banks, credit bureaus and collectors (https://www.consumerfinance.gov/complaint/)</li>
        <li>FTC IdentityTheft.gov — identity theft reports and recovery plans (https://www.identitytheft.gov)</li>
      </ul>

      <p className="mt-10 text-xs text-ink-mute">
        Rules applied: {analysis.matches.map((m) => `${m.moduleId} v${m.moduleVersion} (${m.moduleStatus})`).join(", ")}.
      </p>
    </article>
  );
}
