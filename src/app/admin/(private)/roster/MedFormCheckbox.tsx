"use client";

import { useState, useTransition } from "react";

type Props = {
  value: boolean;
  action: (received: boolean) => Promise<void>;
  showLabel?: boolean;
};

export function MedFormCheckbox({ value, action, showLabel = true }: Props) {
  const [checked, setChecked] = useState(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(nextValue: boolean) {
    const previousValue = checked;
    setChecked(nextValue);
    setError(null);

    startTransition(async () => {
      try {
        await action(nextValue);
      } catch (e) {
        setChecked(previousValue);
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <label className="inline-flex flex-col gap-1">
      {showLabel && (
        <span className="font-mono text-[9px] uppercase tracking-[0.05em] text-ink-faint">
          MED
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={pending}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-ink disabled:opacity-50"
          aria-label="Medical form received"
          title={checked ? "Medical form received" : "Medical form missing"}
        />
        <span className="font-mono text-[11px] text-ink">ABC</span>
      </span>
      {error && (
        <span className="max-w-28 text-[10px] text-danger-text font-mono">
          {error}
        </span>
      )}
    </label>
  );
}
