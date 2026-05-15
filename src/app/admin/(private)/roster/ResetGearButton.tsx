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
        onClick={onClick}
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] px-2.5 py-1 text-warn-text border border-warn-border rounded hover:bg-warn-bg disabled:opacity-50 transition-colors"
      >
        {pending ? "Resetting…" : "Reset gear"}
      </button>
      {error && (
        <span className="text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}
