import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const REQUIRED_FIELDS = ["name", "email", "company", "segment", "annual_spend_band"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (typeof value !== "string" || value.trim() === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const lead = {
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    company: String(body.company).trim(),
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    segment: String(body.segment).trim(),
    annual_spend_band: String(body.annual_spend_band).trim(),
    source_cta: typeof body.source_cta === "string" ? body.source_cta.trim() : "direct",
  };

  if (!supabase) {
    // Supabase not configured — log to the server console so the site works
    // end to end in development and preview environments.
    console.log("[leads] Supabase not configured, logging lead:", lead);
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("leads").insert(lead);
  if (error) {
    console.error("[leads] Supabase insert failed:", error.message);
    return NextResponse.json({ error: "Failed to store lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
