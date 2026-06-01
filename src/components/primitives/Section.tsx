import type { ReactNode } from "react";

type SectionProps = {
  num?: string;
  title: string;
  id?: string;
  children: ReactNode;
};

export function Section({ num, title, id, children }: SectionProps) {
  return (
    <section id={id}>
      <div className="flex items-baseline gap-2.5 section-rule pb-1.5 mb-4">
        {num && (
          <span className="font-mono text-[11px] text-ink-muted shrink-0">
            {num}
          </span>
        )}
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em]">
          {title}
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
