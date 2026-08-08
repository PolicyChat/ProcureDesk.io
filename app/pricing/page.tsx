import type { Metadata } from "next";
import Link from "next/link";
import CtaButton from "@/components/CtaButton";
import Icon from "@/components/Icon";
import { FinalCta } from "@/components/Sections";
import { PRICING } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description: PRICING.intro,
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
            {PRICING.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
            {PRICING.heading}
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft/90">
            {PRICING.intro}
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  tier.highlighted
                    ? "bg-navy-900 text-white shadow-xl shadow-navy-900/20"
                    : "border border-navy-900/10 bg-white"
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-semibold ${
                      tier.highlighted
                        ? "bg-moss-500 text-white"
                        : "bg-navy-900 text-white"
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}
                <h2
                  className={`text-lg font-semibold ${
                    tier.highlighted ? "text-white" : "text-navy-900"
                  }`}
                >
                  {tier.name}
                </h2>
                <p
                  className={`mt-1.5 text-sm ${
                    tier.highlighted ? "text-navy-100/80" : "text-ink-soft/80"
                  }`}
                >
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span
                    className={`font-display text-5xl font-semibold ${
                      tier.highlighted ? "text-white" : "text-navy-900"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.highlighted ? "text-navy-100/70" : "text-ink-soft/70"
                    }`}
                  >
                    {tier.cadence}
                  </span>
                </p>
                <ul className="mt-7 flex-1 space-y-3.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Icon
                        name="check"
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.highlighted ? "text-moss-500" : "text-moss-600"
                        }`}
                      />
                      <span
                        className={
                          tier.highlighted ? "text-navy-100/90" : "text-ink-soft/90"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CtaButton
                    href={tier.cta.href}
                    label={tier.cta.label}
                    variant={tier.highlighted ? "primary" : "secondary"}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-moss-600/25 bg-moss-50 p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-ink">
              <span className="font-semibold text-moss-700">Our honesty guarantee: </span>
              {PRICING.guarantee}
            </p>
          </div>

          <p className="mt-8 text-sm">
            <Link
              href={PRICING.faqTeaser.href}
              className="font-medium text-moss-700 underline-offset-4 transition-colors duration-150 hover:text-moss-600 hover:underline"
            >
              {PRICING.faqTeaser.label}
            </Link>
          </p>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
