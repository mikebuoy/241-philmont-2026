"use client";

import { useState, useTransition } from "react";
import { syncAllMembersAction } from "./actions";

type SyncResult = { membersProcessed: number; itemsAdded: number; itemsUpdated: number };

export function SyncAllButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        const r = await syncAllMembersAction();
        setResult(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={run}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink text-bg text-[12px] font-mono font-medium uppercase tracking-[0.05em] hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Syncing…" : "Sync All Members"}
      </button>
      {result && (
        <span className="font-mono text-[11px] text-ok-text">
          ✓ {result.membersProcessed} members · {result.itemsAdded} added · {result.itemsUpdated} updated
        </span>
      )}
      {error && (
        <span className="font-mono text-[11px] text-danger-text">{error}</span>
      )}
    </div>
  );
}
