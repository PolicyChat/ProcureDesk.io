"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { useCase } from "@/lib/store";
import { Button, Card } from "./ui";

export function PrivacyControls() {
  const { state, dispatch, deleteEverything, hydrated } = useCase();
  const [deleted, setDeleted] = useState(false);
  if (!hydrated) return null;
  return (
    <Card className="mt-8">
      <h2 className="font-semibold">Your data controls</h2>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-0.5 accent-teal-600" checked={state.rememberDevice} onChange={(e) => dispatch({ type: "remember", value: e.target.checked })} />
        <span>
          Remember my case on this device
          <span className="block text-ink-mute">Only turn this on if nobody else uses this device or browser profile.</span>
        </span>
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            if (!confirm("Delete all of your answers, ledger, checklist and document index from this browser? This can't be undone.")) return;
            track("data_deleted");
            deleteEverything();
            setDeleted(true);
          }}
        >
          Delete all my data
        </Button>
        {deleted && <span className="text-sm text-teal-700">Deleted from this browser.</span>}
      </div>
    </Card>
  );
}
