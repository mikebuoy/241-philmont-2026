import type { ItineraryDay } from "@/data/itinerary";
import { StatusBadge } from "./primitives/StatusBadge";

const TYPE_LABEL: Record<ItineraryDay["type"], string> = {
  travel: "Travel",
  acclimation: "Acclimation",
  base: "Base",
  trail: "Trail",
  staffed: "Staffed",
  dry: "Dry Camp",
  layover: "Layover",
};

const TYPE_TONE: Record<
  ItineraryDay["type"],
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

export function ItineraryCard({ day }: { day: ItineraryDay }) {
  const hasFlag =
    day.flags.dryCamp ||
    day.flags.burroPickup ||
    day.flags.burroDropoff ||
    day.flags.summit ||
    day.flags.conservation ||
    day.flags.longestDay ||
    day.flags.hardestDescent;

  return (
    <article
      className="bg-surface border border-border rounded-lg overflow-hidden"
      style={{ borderWidth: "0.5px" }}
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-ink-muted uppercase tracking-[0.05em]">
              {day.weekday} {day.dateShort}
            </span>
            {day.philmontDay != null && (
              <span className="font-mono text-[10px] text-ink-faint">
                · Philmont Day {day.philmontDay}
              </span>
            )}
          </div>
          <h3 className="text-[14px] font-semibold tracking-tight">
            {day.label}
          </h3>
          <p className="text-[12px] text-ink-muted mt-0.5">{day.camp}</p>
        </div>
        <StatusBadge tone={TYPE_TONE[day.type]}>
          {TYPE_LABEL[day.type]}
        </StatusBadge>
      </header>

      {/* Flags row */}
      {hasFlag && (
        <div className="px-4 pt-3 flex flex-wrap gap-1.5">
          {day.flags.dryCamp && <StatusBadge tone="danger">DRY CAMP</StatusBadge>}
          {day.flags.burroPickup && (
            <StatusBadge tone="warn">BURRO PICKUP</StatusBadge>
          )}
          {day.flags.burroDropoff && (
            <StatusBadge tone="warn">BURRO DROP-OFF</StatusBadge>
          )}
          {day.flags.summit && <StatusBadge tone="info">SUMMIT</StatusBadge>}
          {day.flags.conservation && (
            <StatusBadge tone="ok">CONSERVATION</StatusBadge>
          )}
          {day.flags.longestDay && (
            <StatusBadge tone="neutral">LONGEST DAY</StatusBadge>
          )}
          {day.flags.hardestDescent && (
            <StatusBadge tone="danger">HARDEST DESCENT</StatusBadge>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {day.programs.length > 0 && (
          <ul className="space-y-1">
            {day.programs.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-[12px] text-ink"
              >
                <span className="text-ink-faint mt-0.5 shrink-0">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
        {day.notes && (
          <p className="text-[11px] text-ink-muted leading-relaxed">
            {day.notes}
          </p>
        )}
        {day.foodPickup && (
          <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
            Food pickup · {day.foodPickup}
          </div>
        )}
      </div>
    </article>
  );
}
