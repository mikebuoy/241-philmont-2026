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
  STOVE_SAFETY,
  DINNER_STEPS,
  NIGHTLY_BRIEF_STEPS,
  WATER_PURIFICATION,
  LNT_AREAS,
  HYGIENE_RULES,
  type SequenceStep,
} from "@/data/incamp";
import {
  COOK_METHOD_STEPS,
  COOK_TEAM_NOTE,
  COOK_EQUIPMENT,
} from "@/data/cooking";
import { SMELLABLES } from "@/data/safety";

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

export default function InCampPage() {
  return (
    <Page
      eyebrow="Reference"
      title="In Camp"
      meta="Routine · Cook · Bear Bag"
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

      <Section num="05" title="Stove safety">
        <Box variant="warn">
          <strong>Closed-toe shoes required whenever stoves are on.</strong> No exceptions.
        </Box>
        <Panel>
          <ul className="space-y-1.5">
            {STOVE_SAFETY.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-warn-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="06" title="The cook method · 7 steps">
        <Box variant="info">
          <strong>Hybrid cook system.</strong> Fire Maple stove + Bulin HE pot for fast boil. Philmont-issued 8-qt pot for rehydration and serving. 20–40% faster boil at altitude, meaningful fuel savings.
        </Box>
        <ol className="space-y-2">
          {COOK_METHOD_STEPS.map((s) => (
            <li
              key={s.n}
              className="bg-surface border border-border rounded-md p-4 flex items-start gap-3"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="font-mono text-[12px] font-semibold bg-ink text-bg w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {s.n}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold mb-0.5">{s.title}</h3>
                <p className="text-[12px] text-ink-muted leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Panel title="Cook team structure">
          <p className="text-[12px] text-ink-muted leading-relaxed">{COOK_TEAM_NOTE}</p>
        </Panel>
        <Box variant="warn">
          <strong>Every meal · every bowl · every utensil.</strong> Submerge in boiling water. Holding a few seconds in a true rolling boil is the difference between a healthy crew and a crew with norovirus on Trail Day 5.
        </Box>
        <div className="space-y-3">
          <VideoEmbed id="UA_Q1ZnJDvQ" title="Philmont Backcountry Cooking Method" />
          <VideoEmbed id="eLt8XjCG7So" title="How To Wash Dishes" />
        </div>
      </Section>

      <Section num="07" title="Cook equipment">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px] min-w-[520px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {["Item", "Type", "Weight", "Qty", "Notes"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 ${i >= 2 && i <= 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COOK_EQUIPMENT.map((e) => (
                <tr key={e.item} className="border-b border-border last:border-0 align-top">
                  <td className="px-3 py-2.5 font-medium">{e.item}</td>
                  <td className="px-3 py-2.5 text-ink-muted">{e.type}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-ink-muted">{e.weight}</td>
                  <td className="px-3 py-2.5 font-mono text-right">{e.qty}</td>
                  <td className="px-3 py-2.5 text-[11px] text-ink-muted">{e.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="08" title="Bear bag & smellables">
        <Box variant="danger">
          <strong>Deodorant is not allowed in the Philmont backcountry.</strong>{" "}
          Philmont ranger staff will check. This is not a suggestion.
        </Box>
        <Panel title="Required in bear bag · every night">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
            {SMELLABLES.requiredInBearBag.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Prohibited in backcountry">
          <ul className="space-y-1.5">
            {SMELLABLES.prohibitedInBackcountry.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12px]">
                <span className="text-danger-text mt-0.5 shrink-0">✕</span>
                <span className="font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Box variant="warn">
          <strong>If it has a scent or could attract an animal, it goes in the bear bag.</strong>{" "}
          When in doubt, hang it. {SMELLABLES.note}
        </Box>
        <Panel title="Bear hang system">
          <ul className="space-y-2 text-[12px]">
            <li>
              <strong className="text-ink">Ropes.</strong>{" "}
              <span className="text-ink-muted">Two issued ropes — 100 ft × ¼" nylon. <strong>¼" diameter mandatory.</strong> No Dyneema substitution. This is a Philmont spec.</span>
            </li>
            <li>
              <strong className="text-ink">Bags.</strong>{" "}
              <span className="text-ink-muted">4 woven polypropylene bags issued at HQ. Distributed across the crew to balance loads.</span>
            </li>
            <li>
              <strong className="text-ink">Carabiners.</strong>{" "}
              <span className="text-ink-muted">Locking, climbing-rated. Crew-supplied — Philmont does not issue these.</span>
            </li>
            <li>
              <strong className="text-ink">Timing.</strong>{" "}
              <span className="text-ink-muted">Hang every smellable before crew sleeps. Last duty of the day — everyone helps.</span>
            </li>
          </ul>
        </Panel>
        <div className="space-y-3">
          <VideoEmbed id="DN2y50oUcS8" title="How To Hang A Bear Bag" />
          <VideoEmbed id="4IkonO_XkPU" title="Low Impact Bear Bag Hang" />
        </div>
      </Section>

      <Section num="09" title="Water purification">
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

      <Section num="10" title="Hygiene & Leave No Trace">
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

      <Section num="11" title="Dinner & evening">
        <StepList steps={DINNER_STEPS} />
      </Section>

      <Section num="12" title="Nightly brief">
        <StepList steps={NIGHTLY_BRIEF_STEPS} />
      </Section>
    </Page>
  );
}
