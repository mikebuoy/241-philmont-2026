"use client";

import { useState, useTransition } from "react";

type Props = {
  disabled: boolean;
  action: (disabled: boolean) => Promise<void>;
};

export function StatusSelect({ disabled: initialDisabled, action }: Props) {
  const [isDisabled, setIsDisabled] = useState(initialDisabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: boolean) {
    const prev = isDisabled;
    setIsDisabled(next);
    setError(null);
    startTransition(async () => {
      try {
        await action(next);
      } catch (e) {
        setIsDisabled(prev);
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <select
        value={isDisabled ? "disabled" : "enabled"}
        disabled={pending}
        onChange={(e) => onChange(e.target.value === "disabled")}
        className={`rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] disabled:opacity-50 ${
          isDisabled ? "text-danger-text" : "text-ink"
        }`}
        aria-label="Member status"
      >
        <option value="enabled">Enabled</option>
        <option value="disabled">Disabled</option>
      </select>
      {error && (
        <span className="max-w-28 text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}
