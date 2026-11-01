import { NextResponse } from "next/server";
import { EVENTS, sanitizeProps, type EventName } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Anonymous funnel events. No IP, user agent or identifiers are stored.
 * Writes to Supabase `analytics_events` when configured; otherwise logs.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = body?.name as EventName;
  if (!EVENTS.includes(name)) return new NextResponse(null, { status: 204 });
  const props = sanitizeProps(body?.props ?? {});

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    await fetch(`${url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ name, props }),
    }).catch(() => undefined);
  } else if (process.env.NODE_ENV !== "production") {
    console.log("[event]", name, props);
  }
  return new NextResponse(null, { status: 204 });
}
