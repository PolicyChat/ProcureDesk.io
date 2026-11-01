import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { QUESTION_BY_ID } from "@/lib/content/assessment";
import { CATEGORY_REMEDY } from "@/lib/content/remedies";
import { buildExplanationContext, EXPLAIN_KINDS, SYSTEM_PROMPT, type ExplainRequest } from "@/lib/explain";
import type { Facts } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

/** Accept only known intake facts and ledger fields — never free text. */
function sanitize(body: any): ExplainRequest | null {
  if (!body || !EXPLAIN_KINDS.includes(body.kind)) return null;
  const answers: Facts = {};
  for (const [k, v] of Object.entries(body.answers ?? {})) {
    const q = QUESTION_BY_ID[k];
    if (!q) continue;
    const allowed = new Set(q.options.map((o) => o.value));
    if (typeof v === "string" && allowed.has(v)) answers[k] = v;
    else if (Array.isArray(v)) answers[k] = v.filter((x) => typeof x === "string" && allowed.has(x));
  }
  const ledger = Array.isArray(body.ledger)
    ? body.ledger.slice(0, 200).flatMap((e: any) =>
        e && e.category in CATEGORY_REMEDY && Number.isFinite(e.amount)
          ? [{ category: e.category, amount: Number(e.amount), date: typeof e.date === "string" ? e.date.slice(0, 10) : undefined, evidence: ["strong", "moderate", "weak", "none"].includes(e.evidence) ? e.evidence : "none" }]
          : [],
      )
    : [];
  const str = (x: unknown, n = 300) => (typeof x === "string" ? x.slice(0, n) : undefined);
  return {
    kind: body.kind,
    remedyId: str(body.remedyId, 40) as ExplainRequest["remedyId"],
    evidenceId: str(body.evidenceId, 60),
    term: str(body.term, 60),
    action: body.action ? { title: str(body.action.title) ?? "", detail: str(body.action.detail, 800) ?? "" } : undefined,
    answers,
    ledger,
  };
}

export async function POST(req: Request) {
  const parsed = sanitize(await req.json().catch(() => null));
  if (!parsed) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  const ctx = buildExplanationContext(parsed);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: 422 });

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return NextResponse.json({ text: ctx.fallback, source: "approved_content" });
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1024,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `APPROVED CONTENT AND CASE FACTS\n\n${ctx.content}\n\nExplain this to her.` }],
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ text: ctx.fallback, source: "approved_content" });
    }
    const text = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n")
      .trim();
    return NextResponse.json({ text: text || ctx.fallback, source: text ? "claude" : "approved_content" });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn("[explain] rate limited");
    else if (err instanceof Anthropic.APIError) console.error(`[explain] API error ${err.status}: ${err.message}`);
    else console.error("[explain] failed", err);
    return NextResponse.json({ text: ctx.fallback, source: "approved_content" });
  }
}
