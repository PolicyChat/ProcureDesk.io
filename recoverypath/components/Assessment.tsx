"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { QUESTIONS, SECTIONS } from "@/lib/content/assessment";
import { REMEDIES } from "@/lib/content/remedies";
import { evaluate } from "@/lib/engine";
import { useCase } from "@/lib/store";
import type { Question, SectionId } from "@/lib/types";
import { Badge, Button, Card, LinkButton, Notice, Progress, cx } from "./ui";

export function Assessment({ from }: { from?: string }) {
  const { state, dispatch, hydrated, analysis } = useCase();
  const order = useMemo<SectionId[]>(() => {
    const ids = SECTIONS.map((s) => s.id).filter((s) => s !== "about");
    const first = ids.find((s) => s === from);
    return ["about", ...(first ? [first, ...ids.filter((s) => s !== first)] : ids)];
  }, [from]);
  const [step, setStep] = useState(0);
  const done = step >= order.length;

  useEffect(() => {
    if (hydrated) track("assessment_started", { source: from ?? "direct" }, { once: true });
  }, [hydrated, from]);

  if (!hydrated) return <div className="py-24 text-center text-ink-mute">Loading…</div>;

  if (done) return <CheckSummary onBack={() => setStep(order.length - 1)} />;

  const section = SECTIONS.find((s) => s.id === order[step])!;
  const visible = QUESTIONS.filter((q) => q.section === section.id && (!q.showIf || evaluate(q.showIf, state.answers) === "true"));
  const answeredCount = QUESTIONS.filter((q) => state.answers[q.id] !== undefined).length;
  const canContinue = section.id !== "about" || !!state.answers.state;

  function next() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === order.length - 1) {
      track("assessment_completed", { state: String(state.answers.state ?? "none"), count: answeredCount, pathways: analysis.matches.length });
      for (const m of analysis.matches) track("remedy_identified", { kind: m.remedyId, state: String(state.answers.state ?? "none") }, { once: true });
    }
    setStep(step + 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-mute">
          <span>
            Part {step + 1} of {order.length}: <strong className="text-ink">{section.title}</strong>
          </span>
          <span className="tabular">{answeredCount} answered</span>
        </div>
        <Progress value={(step / order.length) * 100} label="Assessment progress" />
      </div>

      <h1 className="font-display text-3xl font-semibold">{section.title}</h1>
      <p className="mt-1 text-ink-soft">{section.intro}</p>

      {section.id === "about" && state.answers.safety_concern === "yes" && (
        <div className="mt-5">
          <Notice tone="clay" title="Your safety comes first">
            If you&apos;re in immediate danger, call 911. The National Domestic Violence Hotline (1-800-799-7233, or text START to 88788) is
            free, confidential and available 24/7, and can help you plan financial steps safely. Use the Quick exit button at the top at any
            time.
          </Notice>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {visible.map((q) => (
          <QuestionCard key={q.id} q={q} value={state.answers[q.id]} onChange={(v) => dispatch({ type: "answer", id: q.id, value: v })} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Back
        </Button>
        <Button size="lg" onClick={next} disabled={!canContinue}>
          {step === order.length - 1 ? "See My Results" : "Continue"}
        </Button>
      </div>
      {!canContinue && <p className="mt-2 text-right text-sm text-ink-mute">Choose a state to continue.</p>}
    </div>
  );
}

function QuestionCard({ q, value, onChange }: { q: Question; value: unknown; onChange: (v: string | string[] | undefined) => void }) {
  const name = `q_${q.id}`;
  return (
    <fieldset className="rounded-2xl border border-paper-line bg-white p-5">
      <legend className="sr-only">{q.prompt}</legend>
      <p className="font-semibold text-ink" aria-hidden="true">{q.prompt}</p>
      {q.help && <p className="mt-1 text-sm text-ink-mute">{q.help}</p>}

      {q.kind === "select" ? (
        <select
          aria-label={q.prompt}
          className="mt-3 w-full rounded-xl border border-paper-line bg-paper px-3 py-2.5"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Choose…</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <div className="mt-3 grid gap-2">
          {q.options.map((o) => {
            const multi = q.kind === "multi";
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const checked = multi ? arr.includes(o.value) : value === o.value;
            return (
              <label
                key={o.value}
                className={cx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition",
                  checked ? "border-teal-500 bg-teal-50" : "border-paper-line hover:border-teal-500/50",
                )}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={name}
                  className="mt-1 accent-teal-600"
                  checked={checked}
                  onChange={() => {
                    if (!multi) return onChange(o.value);
                    const nextArr = checked ? arr.filter((x) => x !== o.value) : [...arr, o.value];
                    onChange(nextArr.length ? nextArr : undefined);
                  }}
                />
                <span>
                  <span className="text-[15px]">{o.label}</span>
                  {o.hint && checked && <span className="mt-0.5 block text-xs text-ink-mute">{o.hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function CheckSummary({ onBack }: { onBack: () => void }) {
  const { analysis, state } = useCase();
  const n = analysis.matches.length;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Your Financial Harm Check</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        {n === 0 ? "We didn't identify a pathway yet" : `We identified ${n} area${n === 1 ? "" : "s"} worth investigating`}
      </h1>
      <p className="mt-3 text-ink-soft">
        {n === 0
          ? "That can change once you add what this cost you. Many people discover debts or payments they hadn't connected to the relationship."
          : "These are areas where your answers match facts our state rules look for. It doesn't mean you have a claim — it means they're worth a closer look."}
      </p>

      {n > 0 && (
        <ul className="mt-6 space-y-3">
          {analysis.matches.map((m) => (
            <li key={m.remedyId}>
              <Card className="flex items-center justify-between gap-3 !p-4">
                <span className="font-semibold">{REMEDIES[m.remedyId].userLabel}</span>
                {m.urgency.some((u) => u.level === "urgent") ? <Badge tone="clay">Time-sensitive</Badge> : <Badge tone="teal">Worth investigating</Badge>}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {state.answers.state === "other" && (
        <div className="mt-6">
          <Notice title="Your state isn't fully covered yet">
            We currently have state-specific content for California, Florida, Illinois, New York and Texas. You&apos;ll see federal options that
            apply everywhere.
          </Notice>
        </div>
      )}

      <Card className="mt-8 bg-teal-50/50">
        <h2 className="font-semibold">Next: what did this cost you?</h2>
        <p className="mt-1 text-sm text-ink-soft">Add the debts, payments and losses. It takes a few minutes and makes every next step more specific.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LinkButton href="/loss" size="lg">Calculate My Loss</LinkButton>
          {n > 0 && <LinkButton href="/results" variant="secondary" size="lg">See My Possible Remedies</LinkButton>}
        </div>
      </Card>
      <button onClick={onBack} className="mt-4 text-sm text-ink-mute hover:text-teal-700">← Change my answers</button>
    </div>
  );
}
