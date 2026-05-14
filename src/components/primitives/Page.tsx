import type { ReactNode } from "react";

type PageProps = {
  eyebrow?: string;
  title: string;
  meta?: string;
  children: ReactNode;
};

export function Page({ eyebrow, title, meta, children }: PageProps) {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <header className="border-b-2 border-ink pb-4 mb-6">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-tight">
          {title}
        </h1>
        {meta && <p className="text-xs text-ink-muted mt-1">{meta}</p>}
      </header>
      <div className="space-y-10">{children}</div>
    </div>
  );
}
