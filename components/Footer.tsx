import Link from "next/link";
import { BRAND, FOOTER } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-900 pb-24 text-navy-100 md:pb-0">
      <div className="mx-auto max-w-wrap px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold text-white">
              {BRAND}
              <span className="text-moss-500">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-navy-100/80">
              {FOOTER.tagline}
            </p>
          </div>
          {FOOTER.columns.map((col) => (
            <div key={col.heading}>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-100/90 transition-colors duration-150 hover:text-moss-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-navy-100/60">
          {FOOTER.legal}
        </p>
      </div>
    </footer>
  );
}
