"use client";

import { useState, useTransition } from "react";
import type { CertificationStatus } from "@/lib/crew";

type Props = {
  label: string;
  value: CertificationStatus | null;
  action: (status: CertificationStatus | null) => Promise<void>;
};

export function CertificationSelect({ label, value, action }: Props) {
  const [currentValue, setCurrentValue] = useState<CertificationStatus | "">(value ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(nextValue: CertificationStatus | "") {
    const previousValue = currentValue;
    setCurrentValue(nextValue);
    setError(null);

    startTransition(async () => {
      try {
        await action(nextValue === "" ? null : nextValue);
      } catch (e) {
        setCurrentValue(previousValue);
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <label className="inline-flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.05em] text-ink-faint">
        {label}
      </span>
      <select
        value={currentValue}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as CertificationStatus | "")}
        className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink disabled:opacity-50"
        aria-label={`${label} certification status`}
      >
        <option value="">Blank</option>
        <option value="certified">Yes</option>
        <option value="not_certified">No</option>
        <option value="tbd">TBD</option>
      </select>
      {error && (
        <span className="max-w-28 text-[10px] text-danger-text font-mono">
          {error}
        </span>
      )}
    </label>
  );
}
