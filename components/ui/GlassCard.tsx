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
    "glass glass-shimmer " +
    (noHover ? "" : "glass-hover ") +
    "p-6 " +
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
