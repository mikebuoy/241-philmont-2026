import type { ReactNode } from "react";

type Tone = "info" | "ok" | "warn" | "danger" | "issued" | "crew" | "neutral";

const tones: Record<Tone, string> = {
  info: "bg-info-bg text-info-text",
  ok: "bg-ok-bg text-ok-text",
  warn: "bg-warn-bg text-warn-text",
  danger: "bg-danger-bg text-danger-text",
  issued: "bg-issued-bg text-issued-text",
  crew: "bg-crew-bg text-crew-text",
  neutral: "bg-surface-2 text-ink-muted",
};

type StatusBadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({
  tone = "neutral",
  children,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`${tones[tone]} font-mono text-[11px] font-medium px-2 py-[3px] rounded inline-flex items-center whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
