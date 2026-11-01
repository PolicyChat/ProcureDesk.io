"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { quickExit } from "@/lib/store";

const STEPS = [
  { href: "/check", label: "Check" },
  { href: "/loss", label: "Loss" },
  { href: "/results", label: "Remedies" },
  { href: "/evidence", label: "Evidence" },
  { href: "/plan", label: "Plan" },
];

export function Header() {
  const path = usePathname();
  const inFlow = STEPS.some((s) => path.startsWith(s.href)) || path.startsWith("/dashboard");
  const activeIdx = STEPS.findIndex((s) => path.startsWith(s.href));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-paper-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#1F6F6B" />
            <path d="M9 22c3-7 6-10 14-12" stroke="#FBF8F3" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <circle cx="23" cy="10" r="2.6" fill="#E9A07F" />
          </svg>
          RecoveryPath
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-ink-mute md:inline">Press Esc twice to leave quickly</span>
          <button
            onClick={() => {
              track("quick_exit");
              quickExit();
            }}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-ink-soft"
            aria-label="Quick exit: leave this site and clear your data from this browser"
          >
            Quick exit
          </button>
        </div>
      </div>
      {inFlow && (
        <nav aria-label="Progress" className="mx-auto max-w-wrap overflow-x-auto px-4 pb-2">
          <ol className="flex min-w-max gap-1 text-sm">
            {STEPS.map((s, i) => {
              const active = i === activeIdx || (path.startsWith("/dashboard") && s.href === "/plan");
              const done = activeIdx > i;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${active ? "bg-teal-600 text-white" : done ? "text-teal-700 hover:bg-teal-50" : "text-ink-mute hover:bg-paper-deep"}`}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="tabular text-xs opacity-80">{i + 1}</span>
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </header>
  );
}
