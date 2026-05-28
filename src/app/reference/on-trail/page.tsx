import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import {
  BREAK_TYPES,
  CATERPILLAR_DESC,
  NAVIGATION_RULES,
  FOOT_CARE,
  HIKING_ETIQUETTE,
  CREW_SEPARATION,
} from "@/data/ontrail";

export const metadata: Metadata = { title: "On Trail" };

export default function OnTrailPage() {
  return (
    <Page
      eyebrow="Reference"
      title="On Trail"
      meta="Etiquette · Navigation · Pace"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Hiking etiquette">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          How we behave on trail reflects on the crew and on the troop. Most of this is common sense — stay together, communicate, respect the people around you. Crew separation is the one rule crews most often miss.
        </p>
        <Panel>
          <ul className="space-y-1.5">
            {HIKING_ETIQUETTE.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Crew separation">
          <p className="text-[12px] text-ink-muted leading-relaxed mb-4">
            {CREW_SEPARATION.rule}
          </p>
          <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-2">
            Passing protocol
          </div>
          <ul className="space-y-1.5 mb-4">
            {CREW_SEPARATION.passing.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-2">
            Self-check
          </div>
          <ul className="space-y-1.5">
            {CREW_SEPARATION.selfCheck.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="02" title="Navigation">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Philmont trails are well-marked but junctions are easy to miss when you are tired and moving fast. The Navigator reads the map before each segment, not after a wrong turn. When in doubt, stop — a wrong junction costs an hour minimum.
        </p>
        <Panel>
          <ul className="space-y-1.5">
            {NAVIGATION_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border" style={{ borderWidth: "0.5px" }}>
          <iframe
            src="https://www.youtube.com/embed/VIh43ViXVY8"
            title="How To Use A Map & Compass"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </Section>

      <Section num="03" title="Pace & breaks">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Pace is set by the slowest person, not the fastest. A crew that fragments on trail is a crew that loses time at every water source, junction, and camp arrival. Structured breaks keep energy even and prevent the bonk that kills the afternoon.
        </p>
        <div className="space-y-2">
          {BREAK_TYPES.map((b) => (
            <div
              key={b.name}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="text-[13px] font-semibold">{b.name}</h3>
                <span className="font-mono text-[11px] bg-surface-2 border border-border px-2 py-0.5 rounded">
                  {b.duration}
                </span>
              </div>
              <ul className="space-y-1.5">
                {b.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2 text-[12px]">
                    <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section num="04" title="Caterpillar technique">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          On steep climbs with a full pack, stopping and restarting is more costly than slowing to a crawl. The caterpillar keeps every hiker moving continuously while letting the crew stay bunched and the back half catch up.
        </p>
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed mb-3">
            <strong className="text-ink">When to use: </strong>
            {CATERPILLAR_DESC.whenToUse}
          </p>
          <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-2">
            How it works
          </div>
          <ol className="space-y-1.5 mb-3">
            {CATERPILLAR_DESC.howItWorks.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[12px]">
                <span className="font-mono text-[10px] text-ink-muted bg-surface-2 border border-border-strong rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] text-ink-muted leading-relaxed">
            <strong className="text-ink">Why it works: </strong>
            {CATERPILLAR_DESC.whyItWorks}
          </p>
        </Panel>
        <a
          href={CATERPILLAR_DESC.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted underline hover:text-ink"
        >
          ▶ {CATERPILLAR_DESC.videoLabel}
        </a>
      </Section>

      <Section num="05" title="Foot care">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Foot problems are the most common reason scouts fall behind or can't finish. Most are preventable. The prep work happens before departure — broken-in boots and trimmed nails matter more than anything you can do on trail after a blister forms.
        </p>
        <Panel title="Before the trek">
          <ul className="space-y-1.5">
            {FOOT_CARE.beforeTrek.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="On trail">
          <ul className="space-y-1.5">
            {FOOT_CARE.onTrail.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Box variant="info">
          <strong>A hot spot treated immediately takes 30 seconds.</strong> A
          blister that develops costs you the rest of the day and several trail
          days after. Stop early.
        </Box>
      </Section>
    </Page>
  );
}
