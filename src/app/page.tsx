import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { Stat } from "@/components/primitives/Stat";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { TREK_META } from "@/data/meta";
import { CREWS } from "@/data/roster";

export default function Home() {
  return (
    <Page
      eyebrow={`Trek ${TREK_META.trekNumber} · ${TREK_META.classification}`}
      title="Philmont 2026"
      meta={`${TREK_META.troop} · ${TREK_META.flyDate} – ${TREK_META.trailEndDate} · ${TREK_META.distanceMiles} miles`}
    >
      <Section num="00" title="Trip at a glance">
        <div className="grid grid-cols-3 gap-2">
          <Stat value={TREK_META.distanceMiles} label="MILES" />
          <Stat value={TREK_META.trailDays} label="TRAIL DAYS" />
          <Stat value="22" label="TOTAL CREW" />
          <Stat
            value={TREK_META.highestPoint.elevation.toLocaleString()}
            label={`HIGH POINT · ${TREK_META.highestPoint.name.toUpperCase()}`}
            tone="gain"
          />
          <Stat
            value={TREK_META.totalElevationGain.toLocaleString()}
            label="TOTAL GAIN (FT)"
            tone="gain"
          />
          <Stat
            value={TREK_META.totalElevationLoss.toLocaleString()}
            label="TOTAL LOSS (FT)"
            tone="loss"
          />
        </div>
      </Section>

      <Section num="01" title="Sister crews">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CREWS.map((c) => (
            <Panel key={c.id} title={`${c.name} · ${c.members.length} members`}>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                Crew Leader{" "}
                <span className="text-ink font-medium">
                  {c.members.find((m) => m.role === "crew_leader")?.name}
                </span>
                {" · "}Lead Advisor{" "}
                <span className="text-ink font-medium">
                  {c.members.find((m) => m.role === "lead_advisor")?.name}
                </span>
              </p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section num="02" title="Locked decisions">
        <Box variant="info">
          <strong>Pack weight target ≤ 20% of body weight.</strong> Philmont's
          official guidance is 25–30%; our crew target is 20% — for experience,
          not survival. The hard ceiling is 25%.
        </Box>
        <Box variant="warn">
          <strong>Dry camp Trail Day 2 (Santa Claus).</strong> Cook dinner at
          the last water source during lunch. Carry 1–2L into camp.
        </Box>
        <Box variant="danger">
          <strong>Deodorant is NOT allowed in the backcountry.</strong>{" "}
          Philmont ranger staff will check.
        </Box>
        <Box variant="ok">
          <strong>Burro packing Days 6–7.</strong> Pickup at Miranda, drop-off
          at Ponil. Mandatory part of this itinerary.
        </Box>
      </Section>

      <Section num="03" title="Phase 0 — Foundation">
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed mb-3">
            Design system, primitives, navigation, and data layer are in place.
            All 22 crew members loaded into both sister crews. Itinerary recalculated
            with the corrected calendar including Fly Day and Acclimation Day.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge tone="ok">9 primitives</StatusBadge>
            <StatusBadge tone="info">5-tab nav</StatusBadge>
            <StatusBadge tone="crew">14 days seeded</StatusBadge>
            <StatusBadge tone="issued">83 core items</StatusBadge>
            <StatusBadge tone="neutral">Phase 1 next</StatusBadge>
          </div>
        </Panel>
      </Section>
    </Page>
  );
}
