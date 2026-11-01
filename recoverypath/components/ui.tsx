import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Variant = "primary" | "secondary" | "ghost" | "accent";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
  accent: "bg-clay-500 text-white hover:bg-clay-600 shadow-sm",
  secondary: "bg-white text-ink border border-paper-line hover:border-teal-500 hover:text-teal-700",
  ghost: "text-teal-700 hover:bg-teal-50",
};
const SIZES = { md: "px-4 py-2.5 text-[15px]", lg: "px-6 py-3.5 text-base", sm: "px-3 py-1.5 text-sm" };

export function buttonClass(variant: Variant = "primary", size: keyof typeof SIZES = "md", extra?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-paper-line bg-white p-5 sm:p-6", className)}>{children}</div>;
}

type Tone = "teal" | "clay" | "gold" | "gray";
const TONES: Record<Tone, string> = {
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  clay: "bg-clay-50 text-clay-600 border-clay-100",
  gold: "bg-gold-50 text-gold-500 border-gold-50",
  gray: "bg-paper-deep text-ink-soft border-paper-line",
};
export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", TONES[tone])}>{children}</span>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-deep">
        <div className="h-full rounded-full bg-teal-500 transition-[width] duration-500" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Stat({ value, label, tone = "ink" }: { value: ReactNode; label: string; tone?: "ink" | "teal" | "clay" }) {
  const color = tone === "teal" ? "text-teal-700" : tone === "clay" ? "text-clay-600" : "text-ink";
  return (
    <div className="rounded-2xl border border-paper-line bg-white p-4">
      <div className={cx("font-display text-3xl font-semibold tabular", color)}>{value}</div>
      <div className="mt-1 text-sm text-ink-mute">{label}</div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{children}</div>}
    </header>
  );
}

export function Notice({ tone = "gray", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-xl border p-4 text-sm leading-relaxed", TONES[tone])}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-ink-soft">{children}</div>
    </div>
  );
}

export { cx };
