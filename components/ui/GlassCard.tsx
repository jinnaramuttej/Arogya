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
    "rounded-xl p-6 " +
    "bg-white border border-gray-200 shadow-card " +
    "dark:bg-gray-800 dark:border-gray-700 " +
    (noHover
      ? ""
      : "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ") +
    "card-shimmer " +
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
