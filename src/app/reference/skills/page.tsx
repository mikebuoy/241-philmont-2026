import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import { STOVE_SAFETY, WATER_PURIFICATION, HYGIENE_RULES, CAMPSITE_STEPS } from "@/data/incamp";
import type { SequenceStep } from "@/data/incamp";
import {
  COOK_METHOD_STEPS,
  COOK_TEAM_NOTE,
  COOK_EQUIPMENT,
} from "@/data/cooking";
import { WATER_SYSTEM } from "@/data/food";
import { SMELLABLES, BEAR_HANG_STEPS } from "@/data/safety";
import { NAVIGATION_RULES } from "@/data/ontrail";

export const metadata: Metadata = { title: "Skills" };

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

export default function SkillsPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Skills"
      meta="Cooking · Water · Bear Bag"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Campsite setup" id="campsite">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Five steps. Same order every time — Bearmuda Triangle first, tents last.
        </p>
        <StepList steps={CAMPSITE_STEPS} />
        <VideoEmbed id="BPnwAUhQjMA" title="How To Set Up A Campsite — Philmont" />
      </Section>

      <Section num="02" title="Bear bag & smellables" id="bear-bag">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Every smellable out of tents, every night. No exceptions.
        </p>
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
        <Box variant="warn">
          <strong>If it has a scent or could attract an animal, it goes in the bear bag.</strong>{" "}
          When in doubt, hang it. {SMELLABLES.note}
        </Box>
        <Panel title="The oops bag · tonight's needs">
          <p className="text-[12px] text-ink-muted mb-2 leading-relaxed">
            Keep the oops bag light — it gets raised and lowered independently. Everything else goes in the main bags before you leave the Bearmuda Triangle.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
            {SMELLABLES.oopsBag.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Bear hang system · gear">
          <ul className="space-y-2 text-[12px]">
            <li>
              <strong className="text-ink">Ropes.</strong>{" "}
              <span className="text-ink-muted">Two issued ropes — 100 ft × ¼" nylon. <strong>¼" diameter mandatory.</strong> Smaller diameter ropes fray on the cable and are harder to hoist. This is a Philmont spec.</span>
            </li>
            <li>
              <strong className="text-ink">Bags.</strong>{" "}
              <span className="text-ink-muted">4 woven polypropylene bags issued at HQ. Crew smellables in the main bags; personal smellables in each crew member's ditty bag.</span>
            </li>
            <li>
              <strong className="text-ink">Carabiner.</strong>{" "}
              <span className="text-ink-muted">One load-bearing carabiner. Crew-supplied — Philmont does not issue these.</span>
            </li>
          </ul>
        </Panel>
        <StepList steps={BEAR_HANG_STEPS} />
        <VideoEmbed id="DN2y50oUcS8" title="How To Hang A Bear Bag" />
      </Section>

      <Section num="03" title="Stove safety" id="stove">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Seven rules. All of them apply every time stoves are on.
        </p>
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

      <Section num="04" title="The cook method · 7 steps" id="cooking">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Philmont&apos;s cook method is a 7-step system. Follow it in order, every meal.
        </p>
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

      <Section num="05" title="Cook equipment" id="equipment">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          What the crew is bringing and why.
        </p>
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

      <Section num="06" title="Water purification" id="water">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Every water source at Philmont must be treated before drinking — springs, streams, and wells included.
        </p>
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
        <Panel title="Crew setup">
          <p className="text-[12px] text-ink-muted mb-3">
            {WATER_SYSTEM.totalFilterPaths} independent filter paths — redundancy by design.
          </p>
          <ul className="space-y-2 mb-3">
            {WATER_SYSTEM.filters.map((f) => (
              <li key={f.item} className="flex items-start gap-3 text-[12px]">
                <span className="font-mono text-[10px] text-ink-muted bg-surface-2 border border-border rounded px-1 py-0.5 shrink-0">×{f.qty}</span>
                <div>
                  <span className="font-medium">{f.item}</span>
                  <span className="text-ink-muted"> · {f.weightOz} oz · {f.notes}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-ink-muted">{WATER_SYSTEM.supplemental}</p>
        </Panel>
        <Panel title="Daily targets">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-surface-2 rounded p-2 text-center">
              <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">Daily target</div>
              <div className="text-[13px] font-semibold">{WATER_SYSTEM.dailyTargetL}</div>
            </div>
            <div className="bg-surface-2 rounded p-2 text-center">
              <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">Standard carry</div>
              <div className="text-[13px] font-semibold">{WATER_SYSTEM.standardCarryL}</div>
            </div>
            <div className="bg-surface-2 rounded p-2 text-center">
              <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">Extended carry</div>
              <div className="text-[13px] font-semibold">{WATER_SYSTEM.extendedCarryL}</div>
            </div>
          </div>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2 text-[12px]">
              <span className="text-ok-text mt-0.5 shrink-0">▸</span>
              <span>{WATER_SYSTEM.hydrationCue}</span>
            </li>
            <li className="flex items-start gap-2 text-[12px]">
              <span className="text-ok-text mt-0.5 shrink-0">▸</span>
              <span>{WATER_SYSTEM.electrolyteGuidance}</span>
            </li>
          </ul>
        </Panel>
        <VideoEmbed id="NJcPZyVfHnQ" title="Water Purification" />
      </Section>

      <Section num="07" title="Backcountry hygiene" id="hygiene">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Four rules. Simple and non-negotiable.
        </p>
        <Panel>
          <ul className="space-y-1.5">
            {HYGIENE_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="08" title="Navigation" id="navigation">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Six rules. A wrong turn at a junction can cost the crew an hour — the Navigator reads the map before each segment, not after.
        </p>
        <ol className="space-y-2">
          {NAVIGATION_RULES.map((rule, i) => (
            <li
              key={rule}
              className="bg-surface border border-border rounded-md p-4 flex items-start gap-3"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="font-mono text-[12px] font-semibold bg-ink text-bg w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed self-center">{rule}</p>
            </li>
          ))}
        </ol>
        <VideoEmbed id="VIh43ViXVY8" title="How To Use A Map & Compass" />
      </Section>
    </Page>
  );
}
