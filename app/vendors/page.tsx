import type { Metadata } from "next";
import CtaButton from "@/components/CtaButton";
import Icon from "@/components/Icon";
import { VENDORS_PAGE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Vendor categories",
  description: VENDORS_PAGE.intro,
};

export default function VendorsPage() {
  const v = VENDORS_PAGE;
  return (
    <>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
            {v.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
            {v.heading}
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft/90">
            {v.intro}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {v.categories.map((cat) => (
              <div
                key={cat.title}
                className="flex flex-col rounded-2xl border border-navy-900/10 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                  <Icon name={cat.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-semibold text-navy-900">{cat.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft/90">
                  {cat.body}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-moss-700">
                  {cat.savings}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
            {v.process.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            {v.process.heading}
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {v.process.steps.map((step, i) => (
              <li key={step.title}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moss-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/90">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
          <div className="rounded-3xl bg-navy-800 px-7 py-12 text-center text-white sm:px-12 md:py-16">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {v.cta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-navy-100/90">
              {v.cta.body}
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton
                href={v.cta.button.href}
                label={v.cta.button.label}
                size="lg"
                withArrow
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
