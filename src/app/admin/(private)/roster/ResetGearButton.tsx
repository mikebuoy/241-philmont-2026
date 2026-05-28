"use client";

import { useState, useTransition } from "react";

type Props = {
  name: string;
  action: () => Promise<void>;
};

export function ResetGearButton({ name, action }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const ok = confirm(
      `Reset ${name}'s gear list?\n\nThis deletes all their items and re-seeds from the current core gear list. Cannot be undone.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reset failed");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-warn-border text-warn-text hover:bg-warn-bg disabled:opacity-50 transition-colors"
        title="Reset gear list"
        aria-label={`Reset ${name}'s gear list`}
      >
        <ResetIcon />
      </button>
      {error && (
        <span className="text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}

function ResetIcon() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </svg>
  );
}
