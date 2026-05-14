import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { Stat } from "@/components/primitives/Stat";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import { ALTITUDE } from "@/data/safety";

export const metadata: Metadata = { title: "Altitude & Safety" };

export default function AltitudePage() {
  return (
    <Page
      eyebrow="Reference"
      title="Altitude & Safety"
      meta="AMS · defenses · critical descents"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Elevation context">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat
            value={`${ALTITUDE.homeBaseElevation.toLocaleString()}`}
            label="HOME (FT)"
          />
          <Stat
            value={`${ALTITUDE.philmontBaseElevation.toLocaleString()}`}
            label="HQ (FT)"
          />
          <Stat
            value={`${ALTITUDE.trailCampRange.min.toLocaleString()}–${ALTITUDE.trailCampRange.max.toLocaleString()}`}
            label="CAMPS (FT)"
          />
          <Stat
            value={`${ALTITUDE.highPoint.elevation.toLocaleString()}`}
            label={`${ALTITUDE.highPoint.location.toUpperCase()} (FT)`}
            tone="gain"
          />
        </div>
        <Box variant="info">
          <strong>You'll step off the plane at 6,500 ft.</strong> Then climb
          to 12,441 ft by Trail Day 5. Hydration starts before you fly.
        </Box>
      </Section>

      <Section num="02" title="Acute Mountain Sickness (AMS)">
        <Box variant="warn">
          <strong>{ALTITUDE.amsNote}</strong>
        </Box>
        <Panel title="Symptoms">
          <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            {ALTITUDE.amsSymptoms.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12px]">
                <span className="text-warn-text mt-0.5 shrink-0">●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="03" title="Defenses">
        <Panel>
          <ol className="space-y-2">
            {ALTITUDE.defenses.map((d, i) => (
              <li
                key={d}
                className="flex items-start gap-3 text-[12px]"
              >
                <span className="font-mono text-[10px] text-ink-muted bg-surface-2 border border-border-strong rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Section>

      <Section num="04" title="Critical descents">
        <p className="text-[12px] text-ink-muted">
          Descent destroys knees and ankles more than climbing destroys legs.
          Two days demand serious attention.
        </p>
        <div className="space-y-2">
          {ALTITUDE.criticalDescents.map((d) => (
            <div
              key={d.uiLabel}
              className="bg-surface border border-border rounded-md p-4 flex items-baseline justify-between gap-3"
              style={{ borderWidth: "0.5px" }}
            >
              <div>
                <h3 className="text-[13px] font-semibold">{d.uiLabel}</h3>
                <p className="text-[12px] text-ink-muted mt-0.5">{d.desc}</p>
              </div>
              <div className="font-mono text-[18px] font-semibold text-[var(--color-loss)]">
                −{d.lossFt.toLocaleString()} ft
              </div>
            </div>
          ))}
        </div>
        <Box variant="danger">
          <strong>Trekking poles + good ankle support are non-negotiable on
          Trail Day 11.</strong> 6,870 ft of descent in one day. Don't skip
          the poles to save weight.
        </Box>
      </Section>

      <Section num="05" title="Speak up early">
        <Box variant="ok">
          <strong>If you have symptoms, tell your Crew Leader or an
          advisor.</strong> Pushing through silently is how serious AMS
          happens. Treatment is straightforward when caught early — descent,
          rest, hydration.
        </Box>
      </Section>
    </Page>
  );
}
