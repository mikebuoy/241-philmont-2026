import type { ReactNode } from "react";

type PageProps = {
  eyebrow?: string;
  title: string;
  meta?: ReactNode;
  /** Optional right-aligned content next to the title (e.g. EditPageButton). */
  action?: ReactNode;
  /** Optional right-aligned content in the eyebrow row (e.g. status badges). */
  headerRight?: ReactNode;
  children: ReactNode;
};

export function Page({ eyebrow, title, meta, action, headerRight, children }: PageProps) {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <header className="border-b-2 border-ink pb-4 mb-6">
        {(eyebrow || headerRight || action) && (
          <div className="flex items-center justify-between gap-3 mb-1">
            {eyebrow && (
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                {eyebrow}
              </p>
            )}
            <div className="shrink-0 flex items-center gap-2">
              {headerRight}
              {action}
            </div>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-tight">
            {title}
          </h1>
          {meta && <div className="mt-1">{meta}</div>}
        </div>
      </header>
      <div className="space-y-10">{children}</div>
    </div>
  );
}
