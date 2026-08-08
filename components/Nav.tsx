"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND, NAV } from "@/lib/content";
import CtaButton from "./CtaButton";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-sand-50/90 backdrop-blur supports-[backdrop-filter]:bg-sand-50/75">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-wrap items-center justify-between px-5 py-4 sm:px-8"
      >
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-900"
          onClick={() => setOpen(false)}
        >
          {BRAND}
          <span className="text-moss-600">.</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-moss-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-900"
            >
              {link.label}
            </Link>
          ))}
          <CtaButton href={NAV.cta.href} label={NAV.cta.label} />
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-navy-900 hover:bg-sand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-900 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? NAV.menuCloseLabel : NAV.menuOpenLabel}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="h-6 w-6"
          >
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-navy-900/10 bg-sand-50 px-5 pb-6 pt-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-soft hover:bg-sand-100 hover:text-moss-700"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 px-3">
            <CtaButton
              href={NAV.cta.href}
              label={NAV.cta.label}
              className="w-full"
            />
          </div>
        </div>
      )}
    </header>
  );
}
