import type { ReactNode } from "react";

type PageProps = {
  eyebrow?: string;
  title: string;
  meta?: string;
  /** Optional right-aligned content next to the title (e.g. EditPageButton). */
  action?: ReactNode;
  children: ReactNode;
};

export function Page({ eyebrow, title, meta, action, children }: PageProps) {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <header className="border-b-2 border-ink pb-4 mb-6">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
            {eyebrow}
          </p>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-tight">
              {title}
            </h1>
            {meta && <p className="text-xs text-ink-muted mt-1">{meta}</p>}
          </div>
          {action && <div className="shrink-0 mt-1.5">{action}</div>}
        </div>
      </header>
      <div className="space-y-10">{children}</div>
    </div>
  );
}
