import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import { ITINERARY, isoToSlug } from "@/data/itinerary";
import type { ItineraryDay, CampType } from "@/data/itinerary";
import { StatusBadge } from "@/components/primitives/StatusBadge";

export const metadata: Metadata = { title: "Itinerary" };

const TYPE_LABEL: Record<CampType, string> = {
  travel: "Travel",
  acclimation: "Acclimation",
  base: "Base",
  trail: "Trail",
  staffed: "Staffed",
  dry: "Dry Camp",
  layover: "Layover",
};

const TYPE_TONE: Record<
  CampType,
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

export default function ItineraryIndexPage() {
  const preTrek = ITINERARY.filter((d) => d.philmontDay === null);
  const onTrek = ITINERARY.filter((d) => d.philmontDay !== null);

  return (
    <Page
      eyebrow="My Trip"
      title="Itinerary"
      meta="June 14 – 27, 2026 · 14 days · 81 miles"
    >
      <SubNav items={TRIP_SUB} />

      <p className="text-[11px] text-ink-faint">
        Tap any day for trail metrics, map, elevation profile, and activities.
      </p>

      <Section num="01" title="Pre-trek · arrival">
        <ul className="space-y-1.5">
          {preTrek.map((d) => (
            <DayRow key={d.iso} day={d} />
          ))}
        </ul>
      </Section>

      <Section num="02" title="On the ranch · 12 days">
        <ul className="space-y-1.5">
          {onTrek.map((d) => (
            <DayRow key={d.iso} day={d} />
          ))}
        </ul>
      </Section>
    </Page>
  );
}

function flagLabels(d: ItineraryDay): string[] {
  const out: string[] = [];
  if (d.flags.dryCamp) out.push("DRY");
  if (d.flags.burroPickup) out.push("BURRO PICKUP");
  if (d.flags.burroDropoff) out.push("BURRO DROP");
  if (d.flags.summit) out.push("SUMMIT");
  if (d.flags.conservation) out.push("CONSERVATION");
  if (d.flags.hardestDescent) out.push("HARDEST DESCENT");
  if (d.flags.longestDay && !d.flags.hardestDescent) out.push("LONGEST");
  return out;
}

function DayRow({ day: d }: { day: ItineraryDay }) {
  const hasFlag = !!(
    d.flags.dryCamp ||
    d.flags.burroPickup ||
    d.flags.burroDropoff ||
    d.flags.summit ||
    d.flags.conservation ||
    d.flags.longestDay ||
    d.flags.hardestDescent
  );
  return (
    <li>
      <Link
        href={`/trip/itinerary/${isoToSlug(d.iso)}`}
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
            <div className="flex items-center gap-2 mt-0.5">
              {d.miles != null && d.miles > 0 && (
                <span className="font-mono text-[10px] text-ink-muted">
                  {d.miles} mi
                </span>
              )}
              {d.gain != null && d.gain > 0 && (
                <span className="font-mono text-[10px] text-[var(--color-gain)]">
                  +{d.gain.toLocaleString()}
                </span>
              )}
              {d.loss != null && d.loss > 0 && (
                <span className="font-mono text-[10px] text-[var(--color-loss)]">
                  −{d.loss.toLocaleString()}
                </span>
              )}
              {hasFlag && (
                <span className="font-mono text-[10px] text-warn-text">
                  {flagLabels(d).join(" · ")}
                </span>
              )}
            </div>
          </div>
          <StatusBadge tone={TYPE_TONE[d.type]}>
            {TYPE_LABEL[d.type]}
          </StatusBadge>
          <span className="text-ink-faint group-hover:text-ink transition-colors text-[14px] leading-none">
            ›
          </span>
        </div>
      </Link>
    </li>
  );
}
