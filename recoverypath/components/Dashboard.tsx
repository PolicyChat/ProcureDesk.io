"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { startCheckout } from "@/lib/checkout";
import { REMEDIES } from "@/lib/content/remedies";
import { BUCKET_LABELS, BUCKET_ORDER, formatUSD, moduleFor } from "@/lib/engine";
import { PLANS } from "@/lib/pricing";
import { useCase } from "@/lib/store";
import type { ActionStatus, PlanAction, ResolutionStatus } from "@/lib/types";
import { ContentStatusBanner } from "./ContentStatusBanner";
import { Explain } from "./Explain";
import { Badge, Button, Card, LinkButton, PageHeader, Stat, cx } from "./ui";

const RESOLUTION_LABEL: Record<ResolutionStatus, string> = {
  unresolved: "Unresolved",
  disputed: "Disputed",
  attorney_review: "Attorney review",
  resolved: "Resolved",
};

export function Dashboard() {
  const { analysis, state, dispatch } = useCase();
  const [busy, setBusy] = useState(false);
  const statusOf = (id: string): ActionStatus => state.actions[id] ?? "todo";
  const done = analysis.plan.filter((a) => statusOf(a.id) === "done").length;
  const firstOpen = analysis.plan.find((a) => statusOf(a.id) !== "done");

  function setStatus(a: PlanAction, s: ActionStatus) {
    dispatch({ type: "action", id: a.id, status: s });
    if (s === "in_progress") track("action_started", { kind: a.bucket });
    if (s === "done") track("action_completed", { kind: a.bucket });
  }

  function startFirst() {
    if (!firstOpen) return;
    if (statusOf(firstOpen.id) === "todo") setStatus(firstOpen, "in_progress");
    document.getElementById(`action-${firstOpen.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const deadlines = analysis.matches.flatMap((m) => moduleFor(state.answers.state, m.remedyId).deadlines.map((d) => ({ ...d, remedyId: m.remedyId })));

  return (
    <div>
      <PageHeader eyebrow="My Recovery" title={`${formatUSD(analysis.loss.total)} financial impact identified`}>
        Your plan is ordered so you always know the next thing to do. Mark steps as you go — progress stays on this device.
      </PageHeader>

      <ContentStatusBanner statuses={analysis.matches.map((m) => m.moduleStatus)} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(Object.keys(RESOLUTION_LABEL) as ResolutionStatus[]).map((k) => (
          <Stat key={k} value={formatUSD(analysis.loss.byResolution[k])} label={RESOLUTION_LABEL[k].toLowerCase()} tone={k === "resolved" ? "teal" : "ink"} />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              <strong className="text-ink">{done} complete</strong> · {analysis.plan.length - done} pending · {analysis.snapshot.urgent} urgent
            </p>
            {firstOpen && <Button size="lg" onClick={startFirst}>Start My First Action</Button>}
          </div>

          <div className="space-y-8">
            {BUCKET_ORDER.map((bucket) => {
              const items = analysis.plan.filter((a) => a.bucket === bucket);
              if (!items.length) return null;
              return (
                <section key={bucket}>
                  <h2 className={cx("mb-3 font-display text-xl font-semibold", bucket === "do_first" && "text-clay-600")}>{BUCKET_LABELS[bucket]}</h2>
                  <ul className="space-y-3">
                    {items.map((a) => {
                      const st = statusOf(a.id);
                      return (
                        <li key={a.id} id={`action-${a.id}`}>
                          <Card className={cx("!p-4", st === "done" && "opacity-60", st === "in_progress" && "border-teal-500")}>
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 accent-teal-600"
                                checked={st === "done"}
                                onChange={(e) => setStatus(a, e.target.checked ? "done" : "todo")}
                                aria-label={`Mark "${a.title}" complete`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className={cx("font-semibold", st === "done" && "line-through")}>{a.title}</p>
                                  {a.remedyId && <Badge>{REMEDIES[a.remedyId].shortName}</Badge>}
                                  {st === "in_progress" && <Badge tone="teal">In progress</Badge>}
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.detail}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-4">
                                  {st === "todo" && <button className="text-sm font-semibold text-teal-700 hover:underline" onClick={() => setStatus(a, "in_progress")}>Start</button>}
                                  {a.evidenceKey && (
                                    <button
                                      className="text-sm text-ink-mute hover:text-teal-700"
                                      onClick={() => dispatch({ type: "evidence", key: a.evidenceKey!, status: "requested" })}
                                    >
                                      Mark document requested
                                    </button>
                                  )}
                                  <Explain kind="next_step" action={{ title: a.title, detail: a.detail }} label="Explain this step" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <Card className="mt-10">
            <h2 className="font-display text-xl font-semibold">Track each item</h2>
            <p className="mt-1 text-sm text-ink-soft">Update the status of each financial event as things move.</p>
            <ul className="mt-4 divide-y divide-paper-line text-sm">
              {state.ledger.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>{e.description || e.category} <span className="tabular text-ink-mute">· {formatUSD(e.amount)}</span></span>
                  <select
                    value={e.resolution}
                    onChange={(ev) => dispatch({ type: "updateEvent", event: { ...e, resolution: ev.target.value as ResolutionStatus } })}
                    className="rounded-lg border border-paper-line bg-paper px-2 py-1"
                    aria-label={`Status of ${e.description || e.category}`}
                  >
                    {(Object.keys(RESOLUTION_LABEL) as ResolutionStatus[]).map((k) => <option key={k} value={k}>{RESOLUTION_LABEL[k]}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="font-semibold">Your documents</h2>
            <div className="mt-3 space-y-2">
              <LinkButton href="/report" variant="secondary" className="w-full">Claim Readiness Report</LinkButton>
              {state.entitlement === "passport" ? (
                <LinkButton href="/passport" className="w-full">Attorney Case Passport</LinkButton>
              ) : (
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await startCheckout("upgrade");
                    setBusy(false);
                  }}
                >
                  Prepare My Attorney Packet — Upgrade to ${PLANS.passport.price}
                </Button>
              )}
            </div>
          </Card>

          {deadlines.length > 0 && (
            <Card>
              <h2 className="font-semibold">Dates to be aware of</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {deadlines.map((d) => (
                  <li key={d.remedyId + d.label}>
                    <p className="font-medium">{d.label}</p>
                    <p className="text-ink-soft">{d.description}</p>
                    {!d.verified && <p className="mt-0.5 text-xs text-ink-mute">General information — confirm dates that apply to you with an attorney.</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold">Free help</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><a className="text-teal-700 hover:underline" href="https://www.lawhelp.org" target="_blank" rel="noopener noreferrer">LawHelp.org</a> — free and low-cost legal aid near you</li>
              <li><a className="text-teal-700 hover:underline" href="https://www.thehotline.org" target="_blank" rel="noopener noreferrer">The Hotline</a> — 1-800-799-7233, confidential 24/7</li>
              <li><a className="text-teal-700 hover:underline" href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer">CFPB</a> — complaints about creditors and collectors</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
