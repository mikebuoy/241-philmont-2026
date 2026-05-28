import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import {
  LIGHT_SLEEP,
  MORNING_STEPS,
  STAFFED_CAMP_STEPS,
  CAMPSITE_STEPS,
  DINNER_STEPS,
  NIGHTLY_BRIEF_STEPS,
  WATER_PURIFICATION,
  LNT_AREAS,
  HYGIENE_RULES,
  type SequenceStep,
} from "@/data/incamp";

export const metadata: Metadata = { title: "In Camp" };

function StepList({ steps }: { steps: SequenceStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li
          key={i}
          className="bg-surface border border-border rounded-md p-4 flex items-start gap-3"
          style={{ borderWidth: "0.5px" }}
        >
          <div className="font-mono text-[12px] font-semibold bg-ink text-bg w-7 h-7 rounded-full flex items-center justify-center shrink-0">
            {i + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
              <h3 className="text-[13px] font-semibold">{step.title}</h3>
              {step.time && (
                <span className="font-mono text-[10px] text-ink-muted">
                  {step.time}
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {step.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-ink-muted">
                  <span className="shrink-0 mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

function VideoEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div
      className="relative w-full aspect-video rounded-md overflow-hidden border border-border"
      style={{ borderWidth: "0.5px" }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Overview"
      meta="Routine · Water · Hygiene"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Light & sleep plan">
        <div className="space-y-2">
          <div className="bg-surface border border-border rounded-md p-4" style={{ borderWidth: "0.5px" }}>
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">Wake target</div>
            <p className="text-[13px] font-semibold">{LIGHT_SLEEP.wakeTarget}</p>
          </div>
          <div className="bg-surface border border-border rounded-md p-4" style={{ borderWidth: "0.5px" }}>
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">Move target</div>
            <p className="text-[13px] font-semibold">{LIGHT_SLEEP.moveTarget}</p>
          </div>
          <div className="bg-surface border border-border rounded-md p-4" style={{ borderWidth: "0.5px" }}>
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">Bedtime</div>
            <p className="text-[13px] font-semibold">{LIGHT_SLEEP.bedtime}</p>
          </div>
        </div>
        <Box variant="info">
          {LIGHT_SLEEP.specialDays}
        </Box>
        <p className="text-[12px] text-ink-muted">{LIGHT_SLEEP.headlampNote}</p>
      </Section>

      <Section num="02" title="Morning sequence">
        <StepList steps={MORNING_STEPS} />
        <Box variant="warn">
          <strong>Every minute of sluggishness in the morning costs us on trail.</strong>{" "}
          An early start means cooler hiking, getting to activities before other crews, and real downtime when we arrive. A late start means hiking in the heat, arriving behind other crews, and missing programs.
        </Box>
      </Section>

      <Section num="03" title="Arriving at staffed camps">
        <StepList steps={STAFFED_CAMP_STEPS} />
      </Section>

      <Section num="04" title="Campsite setup">
        <StepList steps={CAMPSITE_STEPS} />
        <VideoEmbed id="BPnwAUhQjMA" title="How To Set Up A Campsite — Philmont" />
      </Section>

      <Section num="05" title="Dinner & evening">
        <StepList steps={DINNER_STEPS} />
      </Section>

      <Section num="06" title="Nightly brief">
        <StepList steps={NIGHTLY_BRIEF_STEPS} />
      </Section>

      <Section num="07" title="Water purification">
        <Panel>
          <ul className="space-y-1.5">
            {WATER_PURIFICATION.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <VideoEmbed id="GZAiUVfpDuI" title="What You Need To Safely Treat Water In The Backcountry" />
      </Section>

      <Section num="08" title="Hygiene & Leave No Trace">
        <Panel title="Backcountry hygiene">
          <ul className="space-y-1.5">
            {HYGIENE_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Wilderness Pledge · 5 areas">
          <div className="space-y-2">
            {LNT_AREAS.map((area) => (
              <div key={area.area}>
                <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                  {area.area}
                </div>
                <p className="text-[12px] mt-0.5">{area.rule}</p>
              </div>
            ))}
          </div>
        </Panel>
      </Section>
    </Page>
  );
}
