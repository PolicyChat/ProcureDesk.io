import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-paper-line bg-paper-deep">
      <div className="mx-auto grid max-w-wrap gap-6 px-4 py-10 text-sm text-ink-mute md:grid-cols-[2fr_1fr]">
        <div className="space-y-2 leading-relaxed">
          <p>
            <strong className="text-ink-soft">RecoveryPath is a self-help organization tool, not a law firm.</strong> It doesn&apos;t give legal
            advice, doesn&apos;t tell you whether you have a case, and can&apos;t promise any recovery. Results come from screening rules and
            general information; an attorney can tell you how the law applies to you.
          </p>
          <p>
            If you are in danger, call 911. The National Domestic Violence Hotline is free and confidential, 24/7: 1-800-799-7233 or text
            START to 88788.
          </p>
        </div>
        <ul className="space-y-2 md:text-right">
          <li><Link className="hover:text-teal-700" href="/privacy">Privacy &amp; safety</Link></li>
          <li><Link className="hover:text-teal-700" href="/check">Start the free check</Link></li>
        </ul>
      </div>
    </footer>
  );
}
