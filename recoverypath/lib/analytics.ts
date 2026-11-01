/**
 * Funnel analytics with minimal sensitive information.
 * Only the event name and a few coarse, non-identifying properties are sent:
 * no amounts, no free text, no answers beyond the state.
 */

export const EVENTS = [
  "landing_view",
  "assessment_started",
  "assessment_completed",
  "loss_added",
  "remedy_identified",
  "evidence_started",
  "paywall_viewed",
  "checkout_started",
  "report_purchased",
  "packet_purchased",
  "action_started",
  "action_completed",
  "explanation_requested",
  "quick_exit",
  "data_deleted",
] as const;

export type EventName = (typeof EVENTS)[number];

export const ALLOWED_PROPS = ["state", "count", "pathways", "plan", "source", "kind"] as const;
export type EventProps = Partial<Record<(typeof ALLOWED_PROPS)[number], string | number>>;

export function sanitizeProps(props: Record<string, unknown> = {}): EventProps {
  const out: EventProps = {};
  for (const k of ALLOWED_PROPS) {
    const v = props[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v);
    else if (typeof v === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(v)) out[k] = v;
  }
  return out;
}

const sent = new Set<string>();

/** Fire-and-forget. `once` de-duplicates within a page session. */
export function track(name: EventName, props: Record<string, unknown> = {}, opts: { once?: boolean } = {}) {
  if (typeof window === "undefined") return;
  const dedupe = `${name}:${JSON.stringify(props)}`;
  if (opts.once && sent.has(dedupe)) return;
  sent.add(dedupe);
  const body = JSON.stringify({ name, props: sanitizeProps(props) });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    else fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch {}
}
