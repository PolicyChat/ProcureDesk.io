import Link from "next/link";
import Icon from "./Icon";

type Props = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  withArrow?: boolean;
  className?: string;
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-moss-600 text-white hover:bg-moss-700 focus-visible:outline-moss-700 shadow-sm shadow-moss-600/25",
  secondary:
    "bg-navy-900 text-white hover:bg-navy-700 focus-visible:outline-navy-900",
  ghost:
    "bg-transparent text-navy-900 ring-1 ring-inset ring-navy-900/20 hover:bg-navy-50 focus-visible:outline-navy-900",
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function CtaButton({
  href,
  label,
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {label}
      {withArrow && (
        <Icon
          name="arrow-right"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
      )}
    </Link>
  );
}
