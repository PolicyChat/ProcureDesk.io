"use client";

import { usePathname } from "next/navigation";
import { MOBILE_CTA } from "@/lib/content";
import CtaButton from "./CtaButton";

export default function MobileCta() {
  const pathname = usePathname();
  // The sticky bar would be redundant on the page it links to.
  if (pathname === MOBILE_CTA.href) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-900/10 bg-sand-50/95 p-3 backdrop-blur md:hidden">
      <CtaButton
        href={MOBILE_CTA.href}
        label={MOBILE_CTA.label}
        size="lg"
        withArrow
        className="w-full"
      />
    </div>
  );
}
