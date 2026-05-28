"use client";

import { useState, useTransition } from "react";
import type { CrewRole } from "@/lib/crew";
import { ROLE_LABEL } from "@/data/roster";

const ROLES: CrewRole[] = ["crew_leader", "chaplain_aide", "guia", "scout", "lead_advisor", "advisor"];

type Props = {
  value: CrewRole;
  action: (role: CrewRole) => Promise<void>;
};

export function RoleSelect({ value, action }: Props) {
  const [current, setCurrent] = useState<CrewRole>(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: CrewRole) {
    const prev = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      try {
        await action(next);
      } catch (e) {
        setCurrent(prev);
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <select
        value={current}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as CrewRole)}
        className="w-[112px] rounded border border-border bg-surface px-2 py-1 font-mono text-[10px] text-ink disabled:opacity-50"
        aria-label="Role"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </select>
      {error && (
        <span className="max-w-28 text-[10px] text-danger-text font-mono">{error}</span>
      )}
    </div>
  );
}
