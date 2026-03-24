"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { t } from "@/lib/i18n/translations";

interface SOSButtonProps {
  href?: string;
  onClick?: () => void;
  fixed?: boolean;
  size?: "fab" | "hero";
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
}

export default function SOSButton({
  href = "/emergency",
  onClick,
  fixed = true,
  size = "fab",
  className = "",
  disabled = false,
  ariaLabel,
  title,
}: SOSButtonProps) {
  const { language: lang } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const sizeClasses =
    size === "hero" ? "h-28 w-28 sm:h-32 sm:w-32" : "h-16 w-16";

  const iconClasses = size === "hero" ? "h-12 w-12" : "h-7 w-7";

  const fixedClasses = fixed ? "fixed bottom-8 right-8 z-50" : "";

  const classes = [
    fixedClasses,
    sizeClasses,
    "inline-flex items-center justify-center rounded-full bg-destructive text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform sos-pulse",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label = ariaLabel ?? t("sosText", lang);
  const tooltip = title ?? t("sosText", lang);

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classes}
        aria-label={label}
        title={tooltip}
      >
        <AlertTriangle className={iconClasses} />
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-label={label}
      title={tooltip}
    >
      <AlertTriangle className={iconClasses} />
    </Link>
  );
}

