import {
  FINAL_CTA,
  HOW_IT_WORKS,
  PRICING_PREVIEW,
  PROBLEM,
  SERVICES,
  STATS,
  TESTIMONIALS,
} from "@/lib/content";
import CtaButton from "./CtaButton";
import Icon from "./Icon";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
      {children}
    </p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
      {children}
    </h2>
  );
}

export function Problem() {
  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <Eyebrow>{PROBLEM.eyebrow}</Eyebrow>
        <Heading>{PROBLEM.heading}</Heading>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft/90">
          {PROBLEM.intro}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEM.cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-navy-900/10 bg-white p-7 transition-shadow duration-200 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                <Icon name={card.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">
                {card.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/90">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id={HOW_IT_WORKS.id} className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <Eyebrow>{HOW_IT_WORKS.eyebrow}</Eyebrow>
        <Heading>{HOW_IT_WORKS.heading}</Heading>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.steps.map((step) => (
            <li key={step.number} className="relative">
              <span className="font-display text-5xl font-semibold text-moss-100">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/90">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Stats() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8 md:py-20">
        <h2 className="sr-only">{STATS.heading}</h2>
        <dl className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {STATS.items.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <dt className="order-last mt-2 text-sm text-navy-100/80">
                {stat.label}
              </dt>
              <dd className="font-display text-4xl font-semibold text-moss-500 sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id={SERVICES.id} className="scroll-mt-24 bg-sand-50">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <Eyebrow>{SERVICES.eyebrow}</Eyebrow>
        <Heading>{SERVICES.heading}</Heading>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft/90">
          {SERVICES.intro}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-navy-900/10 bg-white p-7 transition-shadow duration-200 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-moss-50 text-moss-700">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/90">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <Eyebrow>{TESTIMONIALS.eyebrow}</Eyebrow>
        <Heading>{TESTIMONIALS.heading}</Heading>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.items.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl bg-sand-100 p-7"
            >
              <Icon name="quote" className="h-6 w-6 text-moss-600" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="block font-semibold text-navy-900">
                  {t.name}
                </span>
                <span className="text-ink-soft/80">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingPreview() {
  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <div className="rounded-3xl bg-navy-800 px-7 py-12 text-white sm:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-moss-100">
            {PRICING_PREVIEW.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {PRICING_PREVIEW.heading}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-navy-100/90">
            {PRICING_PREVIEW.body}
          </p>
          <div className="mt-8">
            <CtaButton
              href={PRICING_PREVIEW.cta.href}
              label={PRICING_PREVIEW.cta.label}
              size="lg"
              withArrow
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-wrap px-5 py-20 text-center sm:px-8 md:py-28">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
          {FINAL_CTA.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft/90">
          {FINAL_CTA.body}
        </p>
        <div className="mt-9 flex justify-center">
          <CtaButton
            href={FINAL_CTA.button.href}
            label={FINAL_CTA.button.label}
            size="lg"
            withArrow
          />
        </div>
        <p className="mt-5 text-xs text-ink-soft/70">{FINAL_CTA.note}</p>
      </div>
    </section>
  );
}
