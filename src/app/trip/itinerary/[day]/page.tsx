import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { Box } from "@/components/primitives/Box";
import { Stat } from "@/components/primitives/Stat";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { isoToSlug } from "@/data/itinerary";
import type { CampType } from "@/data/itinerary";
import { getItinerary } from "@/lib/itinerary";
import { loadGpxFromStorage } from "@/lib/gpx";
import { ElevationProfile } from "@/components/ElevationProfile";
import { RouteMap } from "@/components/RouteMap";
import { EditPageButton } from "@/components/admin/EditPageButton";
import { SaveConfirmation } from "@/components/admin/SaveConfirmation";

type Params = { day: string };

export async function generateStaticParams(): Promise<Params[]> {
  const days = await getItinerary();
  return days.map((d) => ({ day: isoToSlug(d.iso) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { day } = await params;
  const days = await getItinerary();
  const found = days.find((d) => isoToSlug(d.iso) === day);
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
  const allDays = await getItinerary();
  const idx = allDays.findIndex((d) => isoToSlug(d.iso) === day);
  if (idx === -1) notFound();
  const d = allDays[idx];
  const prev = idx > 0 ? allDays[idx - 1] : null;
  const next = idx < allDays.length - 1 ? allDays[idx + 1] : null;

  const gpxMeta = d.gpx;
  const track = await loadGpxFromStorage(d.gpx?.path ?? null);

  const hasMetrics =
    d.miles != null || d.gain != null || d.loss != null || d.elevation != null;

  return (
    <Page
      eyebrow={`${d.weekday} · ${d.dateShort}${d.philmontDay != null ? ` · Philmont Day ${d.philmontDay}` : ""}`}
      title={d.label}
      meta={d.camp}
    >
      <SaveConfirmation />

      {/* Back link + edit button row */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/trip/itinerary"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink"
        >
          ‹ Back to itinerary
        </Link>
        <EditPageButton href={`/admin/itinerary/${isoToSlug(d.iso)}`} />
      </div>

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

        if (hasMetrics) {
          sections.push({
            title: "Trail metrics",
            render: () => (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {d.miles != null && (
                    <Stat value={`${d.miles} mi`} label="DISTANCE" />
                  )}
                  {d.gain != null && (
                    <Stat
                      value={`+${d.gain.toLocaleString()}`}
                      label="GAIN (FT)"
                      tone="gain"
                    />
                  )}
                  {d.loss != null && (
                    <Stat
                      value={`−${d.loss.toLocaleString()}`}
                      label="LOSS (FT)"
                      tone="loss"
                    />
                  )}
                  {d.elevation != null && (
                    <Stat
                      value={d.elevation.toLocaleString()}
                      label="CAMP ELEV (FT)"
                    />
                  )}
                </div>
                {(d.cumMiles != null || d.cumGain != null) && (
                  <p className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.05em] mt-2">
                    Cumulative{" "}
                    {d.cumMiles != null && `· ${d.cumMiles} mi`}
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
                  </p>
                )}
              </>
            ),
          });
        }
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
              <>
                <RouteMap
                  track={track}
                  partial={gpxMeta?.partial}
                  partialNote={gpxMeta?.note}
                />
                {track && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gpx/${d.gpx!.path}`}
                    download={`philmont-2026-${isoToSlug(d.iso)}.gpx`}
                    className="inline-flex items-center gap-2 mt-2 px-3.5 py-2 bg-surface border border-border rounded-md text-[12px] font-medium text-ink hover:border-ink-muted transition-colors"
                    style={{ borderWidth: "0.5px" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download .gpx file
                  </a>
                )}
              </>
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

    </Page>
  );
}
