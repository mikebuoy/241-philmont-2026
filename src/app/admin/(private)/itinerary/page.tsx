import Link from "next/link";
import { getItinerary } from "@/lib/itinerary";
import { isoToSlug } from "@/data/itinerary";
import { StatusBadge } from "@/components/primitives/StatusBadge";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<
  string,
  "info" | "ok" | "warn" | "danger" | "neutral" | "crew" | "issued"
> = {
  travel: "neutral",
  acclimation: "info",
  base: "issued",
  trail: "neutral",
  staffed: "crew",
  dry: "danger",
  layover: "warn",
};

export default async function AdminItineraryList({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const days = await getItinerary();
  const { saved } = await searchParams;
  const savedDay = saved ? days.find((d) => d.iso === saved) : null;

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <header className="border-b-2 border-ink pb-4 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
          Edit
        </p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Itinerary
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          {days.length} days. Tap to edit notes, programs, badges, GPX.
        </p>
      </header>

      {savedDay && (
        <div
          className="bg-ok-bg text-ok-text rounded-lg p-3.5 mb-6 flex items-start gap-3"
          style={{ borderLeft: "3px solid var(--color-ok-border)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold">
              Saved · {savedDay.label}
            </p>
            <p className="text-[11px] mt-0.5 opacity-90">
              Vercel rebuild in progress. Public site updates in ~60–90
              seconds.
            </p>
          </div>
        </div>
      )}

      <ul className="space-y-1.5">
        {days.map((d) => (
          <li key={d.iso}>
            <Link
              href={`/admin/itinerary/${isoToSlug(d.iso)}`}
              className="group block bg-surface border border-border rounded-md px-3.5 py-2.5 hover:border-ink-muted transition-colors"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-center gap-3">
                <div className="font-mono text-[10px] text-ink-muted w-12 shrink-0">
                  {d.dateShort}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">
                    {d.label} · {d.camp}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-ink-muted">
                    {d.programs.length > 0 && (
                      <span>{d.programs.length} programs</span>
                    )}
                    {d.gpx && (
                      <span className="text-ok-text">GPX ✓</span>
                    )}
                    {d.notes && <span>notes ✓</span>}
                  </div>
                </div>
                <StatusBadge tone={TYPE_TONE[d.type]}>{d.type}</StatusBadge>
                <span className="text-ink-faint group-hover:text-ink transition-colors">
                  ›
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
