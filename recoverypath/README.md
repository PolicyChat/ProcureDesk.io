# RecoveryPath (working name — check trademark/domain before launch)

> Turn relationship-caused financial harm into an organized, state-specific recovery plan: what may be actionable, what money is involved, what evidence is needed, and what to do next.

MVP scope: **4 financial pathways × 5 states** (CA, FL, IL, NY, TX) plus a federal-only fallback for every other state.

| Pathway | What it covers |
| --- | --- |
| Coerced debt & identity misuse | Accounts opened/used in her name, borrowing under threats or deception |
| Contribution recovery | Money put into a partner's house, property or business |
| Abandoned shared obligations | Leases, car loans, joint debt he stopped paying |
| Romance / investment scam | Money sent to someone met romantically online |

## Run it

```bash
cd recoverypath
npm install
cp .env.example .env.local   # every key is optional
npm run dev                  # http://localhost:3001
npm test                     # rules-engine tests
```

Everything works with no keys:
- **No `ANTHROPIC_API_KEY`** → explanation buttons return the approved content verbatim.
- **No `STRIPE_SECRET_KEY`** → checkout is in demo mode (instant unlock, no charge). Set `DEMO_PAYMENTS=false` in production.
- **No Supabase** → analytics events go to the server log.
- **`/admin`** is open in dev, and returns 403 in production unless `ADMIN_PASSWORD` is set (basic auth).

Replit: import the repo, set the run command to `cd recoverypath && npm install && npm run build && npm start`, and add the secrets above.

## The funnel (7 screens)

| Route | Screen | Primary CTA |
| --- | --- | --- |
| `/` | Landing + "What happened?" entry points | Check My Options — Free |
| `/check` | Financial Harm Check — 28 branching questions in 5 sections | See My Results → Calculate My Loss |
| `/loss` | Relationship Financial Loss Calculator (ledger) | Find Out What I Can Do |
| `/results` | Remedy Match — the pathway, why it appeared, info still needed, urgency, state notes, sources | Check What Evidence I Need |
| `/evidence` | Evidence Readiness + on-device document index | Build My Recovery Plan |
| `/plan` | Paywall: snapshot stats, locked plan preview | Unlock My Recovery Plan — $79 |
| `/dashboard` | Paid dashboard: ordered plan, progress, per-item status | Start My First Action / Upgrade to $129 |
| `/report` | Printable Claim Readiness Report (10 sections) | Print / save as PDF |
| `/passport` | Attorney Case Passport (consent gate, print, JSON export) | — |
| `/admin` | Legal-content dashboard: every module, status, version, logic, sources | — |

## Architecture

```
lib/content/assessment.ts   intake questions (fact vocabulary)
lib/content/remedies.ts     remedies, evidence graph, ledger categories, glossary, federal sources
lib/content/states.ts       24 versioned state×remedy modules (status, sources, deadlines, rules)
lib/engine/conditions.ts    three-valued condition evaluator (unknown ≠ false)
lib/engine/match.ts         Remedy Match
lib/engine/evidence.ts      Evidence Readiness
lib/engine/plan.ts          Recovery Action Plan
lib/engine/loss.ts          Loss totals
lib/passport.ts             Case Passport format (recoverypath.case-passport/0.1)
lib/explain.ts              Claude explanation layer: allowed question kinds + system prompt
lib/store.tsx               on-device case state, quick exit, auto sign-out
supabase/migrations/        target Postgres schema with RLS
```

**The rules engine decides; Claude only explains.** Pathways come from deterministic condition trees over the user's structured answers. A pathway only appears when its trigger is definitively true, so an "I'm not sure" answer never matches. Every match records the module id, version and status it came from.

**Explanation layer** (`/api/explain`): there is no free-text question box. The user can only ask one of six questions (why did this remedy appear, why do I need this evidence, where do I get it, what does this term mean, explain this step, rewrite the passport summary). The server re-runs the engine itself and sends Claude only approved content and those engine results. The system prompt forbids new statutes, deadlines, forms, eligibility statements and predictions. If the model refuses or errors, the approved text is shown instead. Model: `claude-opus-5-5` at low effort, with server-side refusal fallback on. Override with `CLAUDE_MODEL`.

**Evidence Readiness methodology:** readiness = Σ(weight × credit) / Σ(weight). Weights are 3 for core items, 2 for important and 1 for helpful. Credit is have = 1, requested = 0.5, anything else = 0. It measures how much evidence has been gathered. It is not a likelihood of winning.

## ⚠️ Legal content status — read before launch

**None of the legal content is attorney reviewed yet.** Every module is `draft`, except `CA.coerced_debt`, which is `legal_review`. Every module has `reviewedBy: null`, and every deadline note has `verified: false`. The citations were chosen because they are well-known primary sources: FCRA §§ 605B/611, FDCPA § 1692g, FCBA § 1666, Reg E, Cal. Civ. Code § 1798.97.1 et seq., Marvin v. Marvin, Morone v. Morone, Hewitt/Blumenthal, Tex. Bus. & Com. Code § 26.01(b)(3), and the state small-claims limits. Each one still has to be checked against the official text by a licensed attorney in that state before it moves to `published`.

`NEXT_PUBLIC_RULES_INCLUDE_UNREVIEWED` controls this:
- `true` (default): the engine runs on unreviewed content, and users see an "Early-access content" banner.
- `false`: the engine serves only `published` modules. Today that means no pathways appear at all.

## Privacy & safety built in

- The free flow needs no account. Case data lives in `sessionStorage` and clears when the tab closes. Users can opt in to "remember on this device".
- A Quick exit button sits in the header, and pressing Esc twice does the same. Both wipe local data and open weather.com.
- After 30 minutes of inactivity, the user is signed out and their data is wiped.
- Uploaded documents never leave the device. Only the file name and chosen category are stored.
- Analytics carry only the event name and an allow-listed set of coarse properties (state, counts). No amounts and no free text.
- The Stripe product name and statement descriptor are neutral ("RP Planning Report").
- The Case Passport has a separate consent gate before it can be printed or exported. RecoveryPath never sends it anywhere.
- Every response sends `no-store`, `no-referrer` and `X-Frame-Options: DENY` headers.

## Known MVP gaps (deliberate, or next up)

- **Entitlements are client-side.** The paid tier is verified against Stripe on return from checkout, then stored in the browser. Before real launch, add Supabase Auth, persist cases and `payments`, and check entitlement on the server.
- There are no accounts or cross-device saves yet. The schema in `supabase/migrations/0001_schema.sql` is ready for them.
- `/admin` is read-only and reads from `lib/content`. The publish workflow (draft → legal review → approved → published, with immutable versions) is enforced in the SQL schema, but there is no editing UI yet.
- `/api/explain` has no rate limiting yet.
- Phase 2 isn't built: the subscription Recovery Tracker and the Deadline Monitor. The ledger already stores a resolution status per item, and the dashboard shows the totals.
- A professional security and privacy review is needed before production.
