import Link from "next/link";
import { notFound } from "next/navigation";
import { REMEDIES } from "@/lib/content/remedies";
import { MODULE_BY_ID, STATE_NAMES } from "@/lib/content/states";
import { describe } from "@/lib/engine/conditions";
import { SourceList } from "@/components/SourceList";
import { Badge, Card, PageHeader } from "@/components/ui";
import { STATUS_TONE } from "@/components/statusTone";

export const dynamic = "force-dynamic";

const WORKFLOW = ["draft", "legal_review", "approved", "published", "retired"] as const;

export default function ModulePage({ params }: { params: { id: string } }) {
  const m = MODULE_BY_ID[decodeURIComponent(params.id)];
  if (!m) notFound();
  const remedy = REMEDIES[m.remedyId];

  return (
    <div>
      <Link href="/admin" className="text-sm text-teal-700 hover:underline">← All modules</Link>
      <PageHeader eyebrow={`${STATE_NAMES[m.state]} → ${remedy.shortName}`} title={m.title} />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        {WORKFLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <Badge tone={s === m.status ? STATUS_TONE[s] : "gray"}>{s === m.status ? "● " : ""}{s.replace("_", " ")}</Badge>
            {i < WORKFLOW.length - 1 && <span className="text-ink-mute">→</span>}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Metadata</h2>
          <dl className="mt-3 grid grid-cols-[9rem_1fr] gap-y-1.5 text-sm">
            <dt className="text-ink-mute">Module id</dt><dd>{m.id}</dd>
            <dt className="text-ink-mute">Version</dt><dd>v{m.version}</dd>
            <dt className="text-ink-mute">Status</dt><dd>{m.status}</dd>
            <dt className="text-ink-mute">Effective date</dt><dd>{m.effectiveDate ?? "—"}</dd>
            <dt className="text-ink-mute">Last verified</dt><dd>{m.lastVerified ?? "Not verified"}</dd>
            <dt className="text-ink-mute">Reviewed by</dt><dd>{m.reviewedBy ?? "Not yet attorney reviewed"}</dd>
            <dt className="text-ink-mute">Pro review at</dt><dd>{m.professionalReviewAt !== undefined ? `$${m.professionalReviewAt.toLocaleString()}` : "—"}</dd>
          </dl>
          <h3 className="mt-5 font-semibold">Changelog</h3>
          <ul className="mt-1 text-sm text-ink-soft">{m.changelog.map((c) => <li key={c.version}>v{c.version} · {c.date} — {c.note}</li>)}</ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Eligibility screening logic</h2>
          <p className="mt-1 text-xs text-ink-mute">Trigger — the pathway appears only when this evaluates TRUE (unknown facts never match).</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-paper p-3 text-xs">{describe(m.trigger)}</pre>
          <h3 className="mt-4 text-sm font-semibold">Supporting signals</h3>
          <ul className="mt-1 space-y-1 text-xs">{m.signals.map((s) => <li key={s.label}><code className="text-ink-mute">{describe(s.when).replace(/\n\s*/g, " ")}</code> → {s.label}</li>)}</ul>
          <h3 className="mt-4 text-sm font-semibold">Urgency rules</h3>
          <ul className="mt-1 space-y-1 text-xs">{m.urgency.map((u) => <li key={u.label}><Badge tone={u.level === "urgent" ? "clay" : "gold"}>{u.level}</Badge> {u.label}</li>)}</ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Plain-language content</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">{m.stateNotes.map((n) => <li key={n}>{n}</li>)}</ul>
          {m.requirements.length > 0 && (<><h3 className="mt-4 text-sm font-semibold">Requirements</h3><ul className="mt-1 list-disc pl-5 text-sm text-ink-soft">{m.requirements.map((n) => <li key={n}>{n}</li>)}</ul></>)}
          <h3 className="mt-4 text-sm font-semibold">Procedure</h3>
          <ol className="mt-1 list-decimal pl-5 text-sm text-ink-soft">{m.procedure.map((n) => <li key={n}>{n}</li>)}</ol>
          <h3 className="mt-4 text-sm font-semibold">Deadlines</h3>
          <ul className="mt-1 space-y-1 text-sm text-ink-soft">{m.deadlines.map((d) => <li key={d.label}><strong>{d.label}</strong> {d.verified ? <Badge tone="teal">verified</Badge> : <Badge tone="gold">unverified</Badge>}<br />{d.description}</li>)}</ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Evidence requirements</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {[...remedy.evidence, ...m.extraEvidence].map((e) => (
              <li key={e.id}><span className="tabular text-ink-mute">w{e.weight}</span> <strong>{e.label}</strong> <span className="text-ink-mute">→ {e.supports}</span></li>
            ))}
          </ul>
          <h2 className="mt-6 font-semibold">Sources &amp; agencies</h2>
          <div className="mt-2"><SourceList sources={[...remedy.baseSources, ...m.sources]} agencies={[...remedy.baseAgencies, ...m.agencies]} /></div>
        </Card>
      </div>
      <p className="mt-6 text-sm text-ink-mute">
        Editing: content is version-controlled in <code>lib/content/states.ts</code> and mirrored to the <code>legal_rule_versions</code> table. To change a
        published module, add a new version with a changelog entry and route it through legal review.
      </p>
    </div>
  );
}
