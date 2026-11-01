import { EntryChips, LandingTracker } from "@/components/Landing";
import { LinkButton } from "@/components/ui";

const STEPS = [
  { n: "1", title: "Tell us what happened", body: "Plain questions about your life — not legal jargon. About 5–8 minutes." },
  { n: "2", title: "See what it cost you", body: "Add debts, payments and losses to a ledger that totals your financial impact." },
  { n: "3", title: "See possible remedies", body: "Our state-specific rules show which pathways may be worth investigating, and why." },
  { n: "4", title: "Know your next step", body: "Check what evidence you have, what's missing and what to do first." },
];

const QUESTIONS = [
  ["What did this cost me?", "A clear, itemized total of the debts, payments and losses."],
  ["What potential remedy applies?", "Pathways matched to your state and your facts — with the reasons shown."],
  ["What can I prove?", "An evidence checklist with what you have, what's missing and where to get it."],
  ["What should I do next?", "An ordered plan: do first, next, then, after that."],
  ["Do I need professional help?", "Where an attorney's review is worth it — and a packet to bring them."],
];

export default function Home({ searchParams }: { searchParams: { timeout?: string } }) {
  return (
    <div>
      <LandingTracker />
      {searchParams.timeout && (
        <div className="mb-6 rounded-xl border border-paper-line bg-white px-4 py-3 text-sm text-ink-soft">
          You were signed out after 30 minutes of inactivity, and your answers were cleared from this browser.
        </div>
      )}

      <section className="grid gap-10 pb-12 pt-4 md:grid-cols-[1.25fr_1fr] md:items-center">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
            A relationship cost you money. Find out what you may be able to do about it.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Identify relationship-related debts, lost money and abandoned financial obligations. See potential remedies in your state, the
            evidence you need and the next steps available to you.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <LinkButton href="/check" size="lg">Check My Options — Free</LinkButton>
            <span className="text-sm text-ink-mute">No account needed. Your answers stay in this browser.</span>
          </div>
        </div>
        <div className="rounded-3xl border border-paper-line bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">What happened?</h2>
          <p className="mt-1 text-sm text-ink-mute">Choose the closest one — you can add more later.</p>
          <EntryChips />
        </div>
      </section>

      <section className="border-t border-paper-line py-12">
        <h2 className="font-display text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-paper-line bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-50 font-semibold text-teal-700">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 border-t border-paper-line py-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Five questions, answered for your situation</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            RecoveryPath translates what happened in your life into the financial and legal pathways that may exist in your state. It
            doesn&apos;t tell you that you have a case, and it never promises a recovery — it helps you get organized and take the next step.
          </p>
        </div>
        <dl className="space-y-4">
          {QUESTIONS.map(([q, a]) => (
            <div key={q} className="rounded-xl border border-paper-line bg-white p-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl bg-teal-900 px-6 py-10 text-paper sm:px-10">
        <h2 className="font-display text-2xl font-semibold">Private by design</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-teal-100 sm:grid-cols-2">
          <li>• The free check works without an account. Answers stay in this browser and clear when you close the tab.</li>
          <li>• A Quick exit button is always at the top. Press Esc twice to leave instantly.</li>
          <li>• You&apos;re signed out automatically after 30 minutes of inactivity.</li>
          <li>• Uploaded documents stay on your device. Your data is never used to train AI models.</li>
        </ul>
        <div className="mt-6">
          <LinkButton href="/check" variant="accent" size="lg">Check My Options — Free</LinkButton>
        </div>
      </section>
    </div>
  );
}
