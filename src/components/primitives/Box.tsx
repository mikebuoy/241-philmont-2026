import type { ReactNode } from "react";

type Variant = "info" | "ok" | "warn" | "danger";

const variants: Record<Variant, string> = {
  info: "bg-info-bg text-info-text border-info-border",
  ok: "bg-ok-bg text-ok-text border-ok-border",
  warn: "bg-warn-bg text-warn-text border-warn-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
};

type BoxProps = {
  variant: Variant;
  children: ReactNode;
  className?: string;
};

export function Box({ variant, children, className = "" }: BoxProps) {
  return (
    <div
      className={`${variants[variant]} border-l-[3px] rounded-r-md px-3.5 py-2.5 text-[12px] leading-[1.7] ${className}`}
    >
      {children}
    </div>
  );
}
