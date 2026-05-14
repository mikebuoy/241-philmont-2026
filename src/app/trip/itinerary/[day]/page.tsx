import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { ITINERARY, GPX_COVERAGE, isoToSlug } from "@/data/itinerary";
import type { ItineraryDay, CampType } from "@/data/itinerary";
import { loadGpxByIso } from "@/lib/gpx";
import { ElevationProfile } from "@/components/ElevationProfile";
import { RouteMap } from "@/components/RouteMap";

type Params = { day: string };

export function generateStaticParams(): Params[] {
  return ITINERARY.map((d) => ({ day: isoToSlug(d.iso) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { day } = await params;
  const found = ITINERARY.find((d) => isoToSlug(d.iso) === day);
  if (!found) return { title: "Day not found" };
  return { title: `${found.label} · ${found.dateShort}` };
}

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

export default async function DayDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { day } = await params;
  const idx = ITINERARY.findIndex((d) => isoToSlug(d.iso) === day);
  if (idx === -1) notFound();
  const d: ItineraryDay = ITINERARY[idx];
  const prev = idx > 0 ? ITINERARY[idx - 1] : null;
  const next = idx < ITINERARY.length - 1 ? ITINERARY[idx + 1] : null;

  const gpxMeta = GPX_COVERAGE[d.iso];
  const track = loadGpxByIso(d.iso);

  const hasMetrics =
    d.miles != null || d.gain != null || d.loss != null || d.elevation != null;
  const hasFlag =
    d.flags.dryCamp ||
    d.flags.burroPickup ||
    d.flags.burroDropoff ||
    d.flags.summit ||
    d.flags.conservation ||
    d.flags.longestDay ||
    d.flags.hardestDescent;

  return (
    <Page
      eyebrow={`${d.weekday} · ${d.dateShort}${d.philmontDay != null ? ` · Philmont Day ${d.philmontDay}` : ""}`}
      title={d.label}
      meta={d.camp}
    >
      {/* Back link */}
      <Link
        href="/trip/itinerary"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink"
      >
        ‹ Back to itinerary
      </Link>

      {/* Type + flags */}
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge tone={TYPE_TONE[d.type]}>
          {TYPE_LABEL[d.type]}
        </StatusBadge>
        {d.flags.dryCamp && <StatusBadge tone="danger">DRY CAMP</StatusBadge>}
        {d.flags.burroPickup && (
          <StatusBadge tone="warn">BURRO PICKUP</StatusBadge>
        )}
        {d.flags.burroDropoff && (
          <StatusBadge tone="warn">BURRO DROP-OFF</StatusBadge>
        )}
        {d.flags.summit && <StatusBadge tone="info">SUMMIT</StatusBadge>}
        {d.flags.conservation && (
          <StatusBadge tone="ok">CONSERVATION</StatusBadge>
        )}
        {d.flags.longestDay && (
          <StatusBadge tone="neutral">LONGEST DAY</StatusBadge>
        )}
        {d.flags.hardestDescent && (
          <StatusBadge tone="danger">HARDEST DESCENT</StatusBadge>
        )}
      </div>

      {(() => {
        // Sequential numbering for whichever sections render
        const sections: { title: string; render: () => React.ReactNode }[] = [];
        const hasTrailContext = d.type !== "travel" && d.type !== "acclimation";

        if (hasTrailContext) {
          sections.push({
            title: "Elevation profile",
            render: () => (
              <ElevationProfile
                track={track}
                partial={gpxMeta?.partial}
                partialNote={gpxMeta?.note}
              />
            ),
          });
        }
        if (hasMetrics) {
          sections.push({
            title: "Trail metrics",
            render: () => (
              <Panel>
                <ul className="text-[12px] space-y-1.5">
                  {d.miles != null && (
                    <Row label="Distance" value={`${d.miles} mi`} />
                  )}
                  {(d.gain != null || d.loss != null) && (
                    <Row
                      label="Gain / Loss"
                      value={
                        <>
                          {d.gain != null && (
                            <span className="text-[var(--color-gain)]">
                              +{d.gain.toLocaleString()}
                            </span>
                          )}
                          {d.gain != null && d.loss != null && " / "}
                          {d.loss != null && (
                            <span className="text-[var(--color-loss)]">
                              −{d.loss.toLocaleString()}
                            </span>
                          )}{" "}
                          ft
                        </>
                      }
                    />
                  )}
                  {(d.cumMiles != null || d.cumGain != null) && (
                    <Row
                      label="Cumulative"
                      value={
                        <>
                          {d.cumMiles != null && `${d.cumMiles} mi`}
                          {d.cumGain != null && d.cumLoss != null && (
                            <>
                              {" · "}
                              <span className="text-[var(--color-gain)]">
                                +{d.cumGain.toLocaleString()}
                              </span>
                              {" / "}
                              <span className="text-[var(--color-loss)]">
                                −{d.cumLoss.toLocaleString()}
                              </span>{" "}
                              ft
                            </>
                          )}
                        </>
                      }
                    />
                  )}
                  {d.elevation != null && (
                    <Row
                      label="Camp elevation"
                      value={`${d.elevation.toLocaleString()} ft`}
                    />
                  )}
                </ul>
              </Panel>
            ),
          });
        }

        sections.push({
          title: "Activities & programs",
          render: () =>
            d.programs.length > 0 ? (
              <Panel>
                <ul className="space-y-2.5">
                  {d.programs.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-[12px]"
                    >
                      <span className="text-ink-faint mt-0.5 shrink-0">▸</span>
                      <span className="text-ink">{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-ink-faint mt-3 leading-snug">
                  Detailed program descriptions will be added as research is
                  completed.
                </p>
              </Panel>
            ) : (
              <Panel>
                <p className="text-[12px] text-ink-muted">None.</p>
              </Panel>
            ),
        });

        if (d.notes || d.foodPickup || d.flags.dryCamp) {
          sections.push({
            title: "Notes",
            render: () => (
              <>
                {d.flags.dryCamp && (
                  <Box variant="danger">
                    <strong>Dry camp protocol.</strong> Cook and eat dinner at
                    the last water source during the lunch stop. Cold lunch
                    bag eaten as camp dinner. No-cook breakfast the next
                    morning. Carry 1–2L water into camp.
                  </Box>
                )}
                {d.notes && (
                  <Panel>
                    <p className="text-[12px] text-ink leading-relaxed">
                      {d.notes}
                    </p>
                  </Panel>
                )}
                {d.foodPickup && (
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                    Food pickup · {d.foodPickup}
                  </div>
                )}
              </>
            ),
          });
        }

        if (hasTrailContext) {
          sections.push({
            title: "Map",
            render: () => (
              <RouteMap
                track={track}
                partial={gpxMeta?.partial}
                partialNote={gpxMeta?.note}
              />
            ),
          });
        }

        return sections.map((s, i) => (
          <Section
            key={s.title}
            num={String(i + 1).padStart(2, "0")}
            title={s.title}
          >
            {s.render()}
          </Section>
        ));
      })()}

      {/* Prev / Next */}
      <nav className="grid grid-cols-2 gap-2 pt-2">
        {prev ? (
          <Link
            href={`/trip/itinerary/${isoToSlug(prev.iso)}`}
            className="bg-surface border border-border rounded-md p-3 hover:border-ink-muted transition-colors"
            style={{ borderWidth: "0.5px" }}
          >
            <span className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.05em] block">
              ‹ Previous
            </span>
            <span className="text-[12px] font-medium text-ink block mt-0.5">
              {prev.label}
            </span>
            <span className="text-[11px] text-ink-muted block">
              {prev.weekday} {prev.dateShort}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/trip/itinerary/${isoToSlug(next.iso)}`}
            className="bg-surface border border-border rounded-md p-3 hover:border-ink-muted transition-colors text-right"
            style={{ borderWidth: "0.5px" }}
          >
            <span className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.05em] block">
              Next ›
            </span>
            <span className="text-[12px] font-medium text-ink block mt-0.5">
              {next.label}
            </span>
            <span className="text-[11px] text-ink-muted block">
              {next.weekday} {next.dateShort}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Flag context */}
      {hasFlag && (
        <p className="text-[11px] text-ink-faint text-center pt-2">
          {/* Padding for layout — flags are surfaced above via badges */}
        </p>
      )}
    </Page>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </li>
  );
}
