import type { ReactNode } from "react";

type StatProps = {
  value: ReactNode;
  label: string;
  tone?: "default" | "gain" | "loss";
  className?: string;
};

const tones = {
  default: "text-ink",
  gain: "text-[var(--color-gain)]",
  loss: "text-[var(--color-loss)]",
} as const;

export function Stat({ value, label, tone = "default", className = "" }: StatProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-md px-3 py-2.5 ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      <div className={`font-mono text-[20px] font-semibold leading-none ${tones[tone]}`}>
        {value}
      </div>
      <div className="text-[11px] text-ink-muted mt-1">{label}</div>
    </div>
  );
}
