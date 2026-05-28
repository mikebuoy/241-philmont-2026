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
    <div className="inline-flex flex-col items-center gap-1">
      <input
        type="checkbox"
        checked={!isDisabled}
        disabled={pending}
        onChange={(e) => onChange(!e.target.checked)}
        className="h-4 w-4 accent-ink disabled:opacity-50"
        aria-label={isDisabled ? "Mark member active" : "Mark member disabled"}
        title={isDisabled ? "Member disabled. Click to mark active." : "Member active. Click to disable."}
      />
      {error && (
        <span className="max-w-28 text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}
