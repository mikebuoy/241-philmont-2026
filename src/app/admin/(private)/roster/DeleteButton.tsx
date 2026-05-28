"use client";

import { useState, useTransition } from "react";

type Props = {
  name: string;
  action: () => Promise<void>;
};

export function DeleteButton({ name, action }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const ok = confirm(`Delete ${name}? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
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
        title="Delete member"
        aria-label={`Delete ${name}`}
      >
        <TrashIcon />
      </button>
      {error && (
        <span className="text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}
