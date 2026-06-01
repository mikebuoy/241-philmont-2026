import type { Metadata } from "next";
import Link from "next/link";
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
      meta="Routine · Sequences · Camp"
    >
      <SubNav items={REFERENCE_SUB} />

      <p className="text-[12px] text-ink-muted leading-relaxed">
        Standard operating procedures for every day on trail — morning wake-up
        through lights out. These sequences keep the crew moving efficiently,
        eating well, and sleeping enough to do it again the next day.
      </p>

      <Section num="01" title="Wake and sleep timing" id="timing">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Early starts are the single biggest factor in a good day. Leaving
          before or at sunrise means cooler hiking, getting to staffed camps
          before other crews, and real downtime in the afternoon. Afternoon
          lightning at elevation makes late starts genuinely dangerous. At the
          other end, {'"'}hiker{`'`}s midnight{'"'} — going to bed when it gets
          dark — is how we bank enough sleep to wake at 4:30 and move well.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface border border-border rounded-md p-4" style={{ borderWidth: "0.5px" }}>
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">Wake</div>
            <p className="text-[13px] font-semibold">{LIGHT_SLEEP.wakeTarget}</p>
          </div>
          <div className="bg-surface border border-border rounded-md p-4" style={{ borderWidth: "0.5px" }}>
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">Move</div>
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

      <Section num="02" title="Morning sequence" id="morning">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Five steps from 4:30 AM to hiking. In order, every day.
        </p>
        <StepList steps={MORNING_STEPS} />
        <Box variant="warn">
          <strong>Every minute of sluggishness in the morning costs us on trail.</strong>{" "}
          An early start means cooler hiking, getting to activities before other crews, and real downtime when we arrive. A late start means hiking in the heat, arriving behind other crews, and missing programs.
        </Box>
        <Panel title="Before you leave home" className="bg-info-bg border-info-border">
          <div className="space-y-3">
            <div>
              <p className="text-[12px] font-semibold mb-0.5">No cooking, no coffee in the morning.</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                We are moving, not making breakfast. If you need caffeine to function, figure out a cold solution before you leave home. A caffeinated electrolyte packet mixed into your water bottle is a solid option — you get caffeine and hydration at the same time.
              </p>
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-0.5">If you are a slow morning person, plan to wake up earlier.</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                We are working as a team to get up and out together. Do not make the crew wait on you. If you need more time, set your alarm earlier.
              </p>
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-0.5">Practice packing up your gear in the dark before you leave home.</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                Do it with a headlamp, in the same order every time. Organization and repeatable routine are what make a 20-minute pack-up possible. If the first time you do this in the dark is at Philmont, you will be the one slowing the crew down.
              </p>
            </div>
          </div>
        </Panel>
      </Section>

      <Section num="03" title="Arriving at staffed camps" id="staffed-camps">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          What to do the moment you walk into a staffed camp — in order.
        </p>
        <StepList steps={STAFFED_CAMP_STEPS} />
      </Section>

      <Section num="04" title="Campsite setup" id="campsite">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          How to set up a proper backcountry camp. This order matters.
        </p>
        <StepList steps={CAMPSITE_STEPS} />
        <VideoEmbed id="BPnwAUhQjMA" title="How To Set Up A Campsite — Philmont" />
      </Section>

      <Section num="05" title="Dinner & evening" id="dinner">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Dinner is a system. Run it the same way every night.
        </p>
        <StepList steps={DINNER_STEPS} />
        <p className="text-[12px] text-ink-muted">
          Full cook method, stove safety, and equipment →{" "}
          <Link href="/reference/skills" className="underline hover:text-ink">
            Cooking
          </Link>
        </p>
      </Section>

      <Section num="06" title="Nightly brief" id="nightly-brief">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          End every day with a clear plan for the next one.
        </p>
        <StepList steps={NIGHTLY_BRIEF_STEPS} />
        <p className="text-[12px] text-ink-muted">
          Full smellables list, hang system, and bear bag procedures →{" "}
          <Link href="/reference/skills" className="underline hover:text-ink">
            Skills
          </Link>
        </p>
      </Section>

      <p className="text-[12px] text-ink-muted">
        Water treatment, crew setup, and hygiene →{" "}
        <Link href="/reference/skills" className="underline hover:text-ink">
          Skills
        </Link>
      </p>
    </Page>
  );
}
