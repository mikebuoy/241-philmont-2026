import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-4 sm:p-[1.1rem] ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      {title && (
        <p className="font-mono text-[10px] font-medium text-ink-muted uppercase tracking-[0.08em] mb-4">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
