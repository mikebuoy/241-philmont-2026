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
} from "@/data/ontrail";

export const metadata: Metadata = { title: "On Trail" };

export default function OnTrailPage() {
  return (
    <Page
      eyebrow="Reference"
      title="On Trail"
      meta="Pace · Navigation · Foot Care"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Pace & breaks">
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

      <Section num="02" title="Caterpillar technique">
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

      <Section num="03" title="Navigation">
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

      <Section num="04" title="Foot care">
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

      <Section num="05" title="Hiking etiquette">
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
      </Section>
    </Page>
  );
}
