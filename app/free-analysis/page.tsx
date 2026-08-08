import type { Metadata } from "next";
import Icon from "@/components/Icon";
import LeadForm from "@/components/LeadForm";
import { LEAD_FORM } from "@/lib/content";

export const metadata: Metadata = {
  title: "Free spend analysis",
  description: LEAD_FORM.intro,
};

export default function FreeAnalysisPage() {
  const c = LEAD_FORM;
  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
              {c.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
              {c.heading}
            </h1>
            <p className="mt-5 leading-relaxed text-ink-soft/90">{c.intro}</p>
            <ul className="mt-8 space-y-4">
              {c.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-ink">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-moss-600" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-2xl border border-navy-900/10 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-900">
                {c.nextSteps.heading}
              </h2>
              <ol className="mt-4 space-y-4">
                {c.nextSteps.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-ink-soft/90">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss-50 text-xs font-bold text-moss-700">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm sm:p-10 lg:self-start">
            <LeadForm sourceCta="free-analysis-page" />
          </div>
        </div>
      </div>
    </section>
  );
}
