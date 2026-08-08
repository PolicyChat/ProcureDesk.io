import { FAQ } from "@/lib/content";

export default function Faq() {
  return (
    <section id={FAQ.id} className="scroll-mt-24 bg-sand-50">
      <div className="mx-auto max-w-wrap px-5 py-20 sm:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-moss-700">
          {FAQ.eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
          {FAQ.heading}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FAQ.items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-navy-900/10 bg-white p-6 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-moss-600 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft/90">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
