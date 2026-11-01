"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { LEDGER_CATEGORIES, REMEDIES } from "@/lib/content/remedies";
import { formatUSD } from "@/lib/engine";
import { newId, useCase } from "@/lib/store";
import type { EvidenceStrength, FinancialEvent, LedgerCategory } from "@/lib/types";
import { Badge, Button, Card, LinkButton, Notice, PageHeader } from "./ui";

const STRENGTH: { value: EvidenceStrength; label: string; hint: string }[] = [
  { value: "strong", label: "Strong", hint: "Statements, receipts or contracts" },
  { value: "moderate", label: "Moderate", hint: "Some records or messages" },
  { value: "weak", label: "Weak", hint: "Mostly my memory" },
  { value: "none", label: "None yet", hint: "I'd need to find it" },
];
const STRENGTH_TONE = { strong: "teal", moderate: "gold", weak: "clay", none: "gray" } as const;

const blank = (): Omit<FinancialEvent, "id"> => ({ category: "card_in_name", description: "", amount: 0, date: "", evidence: "moderate", resolution: "unresolved" });

export function LossLedger() {
  const { state, dispatch, analysis } = useCase();
  const [draft, setDraft] = useState(blank());
  const [amountText, setAmountText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const total = analysis.loss.total;
  const catById = Object.fromEntries(LEDGER_CATEGORIES.map((c) => [c.id, c]));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Math.round(Number(amountText.replace(/[^0-9.]/g, "")));
    if (!amount || amount <= 0) return;
    const event: FinancialEvent = { ...draft, amount, id: editing ?? newId(), date: draft.date || undefined };
    dispatch({ type: editing ? "updateEvent" : "addEvent", event });
    if (!editing) track("loss_added", { count: state.ledger.length + 1 });
    setDraft({ ...blank(), category: draft.category });
    setAmountText("");
    setEditing(null);
  }

  function edit(ev: FinancialEvent) {
    setEditing(ev.id);
    setDraft({ ...ev, date: ev.date ?? "" });
    setAmountText(String(ev.amount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader eyebrow="Relationship Financial Loss Calculator" title="What did this cost you?">
        List each debt, payment or loss separately. Rough amounts are fine — you can refine them later. Avoid typing account numbers or
        anyone&apos;s full name.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold">Type of financial event</span>
                <select
                  className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2.5"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as LedgerCategory })}
                >
                  {LEDGER_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-ink-mute">e.g. {catById[draft.category].example}</span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Short description</span>
                <input
                  className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2.5"
                  placeholder="e.g. Store credit card"
                  maxLength={80}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Amount (USD)</span>
                <input
                  className="tabular mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2.5"
                  inputMode="decimal"
                  placeholder="11,700"
                  required
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Approximate date <span className="font-normal text-ink-mute">(optional)</span></span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-paper-line bg-paper px-3 py-2.5"
                  value={draft.date ?? ""}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <fieldset className="block">
                <legend className="text-sm font-semibold">How well can you document it?</legend>
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {STRENGTH.map((s) => (
                    <label key={s.value} title={s.hint} className={`cursor-pointer rounded-lg border px-2 py-1.5 text-center text-sm ${draft.evidence === s.value ? "border-teal-500 bg-teal-50 font-semibold" : "border-paper-line"}`}>
                      <input type="radio" className="sr-only" name="strength" checked={draft.evidence === s.value} onChange={() => setDraft({ ...draft, evidence: s.value })} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit">{editing ? "Save changes" : "Calculate My Financial Impact"}</Button>
                {editing && (
                  <Button type="button" variant="ghost" onClick={() => { setEditing(null); setDraft(blank()); setAmountText(""); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {state.ledger.length > 0 && (
            <Card className="overflow-x-auto !p-0">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-paper-line bg-paper-deep text-ink-mute">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Financial event</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Evidence</th>
                    <th className="px-4 py-3 font-semibold">Possible pathway</th>
                    <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {state.ledger.map((ev) => {
                    const cat = catById[ev.category];
                    return (
                      <tr key={ev.id} className="border-b border-paper-line last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{ev.description || cat.label}</div>
                          <div className="text-xs text-ink-mute">{cat.label}{ev.date ? ` · ${ev.date}` : ""}</div>
                        </td>
                        <td className="tabular px-4 py-3 text-right font-semibold">{formatUSD(ev.amount)}</td>
                        <td className="px-4 py-3"><Badge tone={STRENGTH_TONE[ev.evidence]}>{STRENGTH.find((s) => s.value === ev.evidence)?.label}</Badge></td>
                        <td className="px-4 py-3 text-ink-soft">{cat.remedyId ? REMEDIES[cat.remedyId].shortName : "General review"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button className="text-teal-700 hover:underline" onClick={() => edit(ev)}>Edit</button>
                          <button className="ml-3 text-ink-mute hover:text-clay-600" onClick={() => dispatch({ type: "removeEvent", id: ev.id })}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-paper-deep font-semibold">
                    <td className="px-4 py-3">Total identified</td>
                    <td className="tabular px-4 py-3 text-right">{formatUSD(total)}</td>
                    <td colSpan={3} />
                  </tr>
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card className="text-center">
            <div className="font-display text-4xl font-semibold tabular text-ink">{formatUSD(total)}</div>
            <p className="mt-1 text-sm text-ink-soft">in financial impact identified</p>
            <div className="mt-4 space-y-1 text-left text-sm">
              {Object.entries(analysis.loss.byRemedy).filter(([, v]) => v > 0).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-ink-soft">{k === "unassigned" ? "General review" : REMEDIES[k as keyof typeof REMEDIES].shortName}</span>
                  <span className="tabular font-medium">{formatUSD(v)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Notice>
            This is what the relationship cost you on paper — <strong>not</strong> an amount you can recover. What may be recoverable depends on the
            law, the evidence and the other side.
          </Notice>
          <LinkButton href="/results" size="lg" className="w-full">Find Out What I Can Do</LinkButton>
        </aside>
      </div>
    </div>
  );
}
