import { HERO } from "@/lib/content";
import CtaButton from "./CtaButton";
import Icon from "./Icon";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-moss-600/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-navy-700/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-28">
        <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-moss-100 ring-1 ring-inset ring-white/15">
          {HERO.eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {HERO.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-100/90 md:text-xl">
          {HERO.subhead}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton
            href={HERO.primaryCta.href}
            label={HERO.primaryCta.label}
            size="lg"
            withArrow
          />
          <CtaButton
            href={HERO.secondaryCta.href}
            label={HERO.secondaryCta.label}
            size="lg"
            variant="ghost"
            className="!text-white !ring-white/30 hover:!bg-white/10"
          />
        </div>
        <ul className="mt-10 flex flex-col gap-3 text-sm text-navy-100/90 sm:flex-row sm:flex-wrap sm:gap-x-8">
          {HERO.bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 shrink-0 text-moss-500" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
