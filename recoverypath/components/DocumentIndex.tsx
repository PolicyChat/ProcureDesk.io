"use client";

import { useRef } from "react";
import { REMEDIES } from "@/lib/content/remedies";
import { newId, useCase } from "@/lib/store";
import { Button, Card } from "./ui";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.docx,.txt";

/** Keyword hints → evidence item id. The user always confirms the category. */
const HINTS: [RegExp, string][] = [
  [/credit[ _-]?report|equifax|experian|transunion/i, "credit_report"],
  [/statement|stmt/i, "account_statements"],
  [/application|apply/i, "account_application"],
  [/ftc|police|identity/i, "police_or_ftc_report"],
  [/collect|notice|demand/i, "creditor_correspondence"],
  [/deed|title|registration|llc|articles/i, "ownership_records"],
  [/receipt|invoice/i, "receipts_invoices"],
  [/lease|loan[ _-]?agreement|contract/i, "signed_agreement"],
  [/wire|zelle|venmo|cashapp|transfer|transaction|wallet|btc|crypto/i, "transaction_records"],
  [/chat|whatsapp|telegram|messages?|texts?|sms|screenshot/i, "conversation_logs"],
  [/ic3|complaint|claim/i, "report_numbers"],
];

export function DocumentIndex() {
  const { state, dispatch, analysis } = useCase();
  const input = useRef<HTMLInputElement>(null);

  const categories = analysis.readiness.list.flatMap((r) =>
    r.items.map((i) => ({ key: i.key, id: i.id, label: `${REMEDIES[r.remedyId].shortName} — ${i.label}` })),
  );

  function suggest(name: string): string {
    for (const [re, id] of HINTS) {
      if (!re.test(name)) continue;
      const hit = categories.find((c) => c.id === id) ?? categories.find((c) => c.id.endsWith(id));
      if (hit) return hit.key;
    }
    return "uncategorized";
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      dispatch({
        type: "addDoc",
        doc: { id: newId(), name: f.name, size: f.size, type: f.type || f.name.split(".").pop() || "", category: suggest(f.name), addedAt: new Date().toISOString() },
      });
    }
    if (input.current) input.current.value = "";
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Document index</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Add PDFs, photos, Word or text files to build an index for your attorney packet. <strong>Files never leave your device</strong> —
            we only record the file name and the category you choose.
          </p>
        </div>
        <Button variant="secondary" onClick={() => input.current?.click()}>Add documents</Button>
        <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => onFiles(e.target.files)} aria-label="Add documents" />
      </div>

      {state.documents.length > 0 && (
        <ul className="mt-4 divide-y divide-paper-line text-sm">
          {state.documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="min-w-0 flex-1 truncate font-medium" title={d.name}>{d.name}</span>
              <select
                aria-label={`Category for ${d.name}`}
                value={d.category}
                onChange={(e) => dispatch({ type: "updateDoc", id: d.id, category: e.target.value })}
                className="max-w-xs rounded-lg border border-paper-line bg-paper px-2 py-1"
              >
                <option value="uncategorized">Uncategorized</option>
                {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <button className="text-ink-mute hover:text-clay-600" onClick={() => dispatch({ type: "removeDoc", id: d.id })}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {state.documents.some((d) => d.category !== "uncategorized") && (
        <p className="mt-2 text-xs text-ink-mute">Categories were suggested from file names — please check each one.</p>
      )}
    </Card>
  );
}
