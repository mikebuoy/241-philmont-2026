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
        onClick={onClick}
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] px-2.5 py-1 text-danger-text border border-danger-border rounded hover:bg-danger-bg disabled:opacity-50 transition-colors"
      >
        {pending ? "Unbinding…" : "Unbind"}
      </button>
      {error && (
        <span className="text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}
