import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  noHover?: boolean;
  as?: "div" | "a";
  href?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  noHover = false,
  as = "div",
  href,
  onClick,
}: GlassCardProps) {
  const base =
    "rounded-2xl p-6 " +
    "bg-card/90 border border-border/60 shadow-lg shadow-primary/5 " +
    (noHover
      ? ""
      : "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card ") +
    className;

  if (as === "a" && href) {
    return (
      <a href={href} className={base + " block no-underline text-inherit"} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <div className={base} onClick={onClick}>
      {children}
    </div>
  );
}
