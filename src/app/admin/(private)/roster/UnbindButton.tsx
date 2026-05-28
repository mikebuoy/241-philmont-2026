"use client";

import { useState, useTransition } from "react";

type Props = {
  name: string;
  action: () => Promise<void>;
};

export function UnbindButton({ name, action }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const ok = confirm(
      `Unbind ${name}? They'll lose their roster identity and can re-claim with a fresh sign-in. Sign-in itself still works.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unbind failed");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-danger-border text-danger-text hover:bg-danger-bg disabled:opacity-50 transition-colors"
        title="Unbind sign-in"
        aria-label={`Unbind ${name}'s sign-in`}
      >
        <UnlinkIcon />
      </button>
      {error && (
        <span className="text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}

function UnlinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
      <path d="M4 4l16 16" />
    </svg>
  );
}
