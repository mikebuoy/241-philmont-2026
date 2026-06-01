import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import {
  MEDICAL_STANDARDS,
  TRADING_POSTS,
  TREK_LOGISTICS,
  ARRIVAL_SCHEDULE,
  BASECAMP_CHECKIN,
} from "@/data/trek";
import { RESUPPLY_SCHEDULE, DRY_CAMP } from "@/data/food";

export const metadata: Metadata = { title: "Trek Logistics" };

export default function TrekLogisticsPage() {
  return (
    <Page
      eyebrow="My Trek"
      title="Logistics"
      meta="Dates · Check-in · Medical · Burro · Gear"
    >
      <SubNav items={TRIP_SUB} />

      <Panel title="Emergency contact">
        <p className="text-[13px] font-mono font-semibold">
          {TREK_LOGISTICS.cellService.emergencyNumber}
        </p>
        <p className="text-[12px] text-ink-muted mt-1 leading-relaxed">
          {TREK_LOGISTICS.cellService.emergencyNote}
        </p>
      </Panel>

      <Section num="01" title="Important dates" id="important-dates">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Key dates from arrival through departure. Four Base Camp days before the trail starts, eleven trail days, then home.
        </p>
        <div className="space-y-2">
          {ARRIVAL_SCHEDULE.map((item) => (
            <div
              key={item.date}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[13px] font-semibold">{item.label}</h3>
                <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
                  {item.date}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="02" title="Basecamp check-in" id="basecamp-checkin">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          {BASECAMP_CHECKIN.intro}
        </p>
        <div
          className="bg-surface border border-border rounded-md px-4 py-3 text-[12px] text-ink-muted"
          style={{ borderWidth: "0.5px" }}
        >
          <strong className="text-ink">Tip:</strong> {BASECAMP_CHECKIN.arrivalTip}
        </div>

        <div className="space-y-2">
          {BASECAMP_CHECKIN.stops.map((stop) => (
            <div
              key={stop.step}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="font-mono text-[10px] text-ink-faint bg-surface-2 border border-border rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {stop.step}
                </span>
                <h3 className="text-[13px] font-semibold">{stop.title}</h3>
              </div>
              <ul className="space-y-1 ml-8">
                {stop.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-[12px]">
                    <span className="text-ink-faint mt-0.5 shrink-0">▸</span>
                    <span className="text-ink-muted">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="bg-surface border border-border rounded-md p-4"
          style={{ borderWidth: "0.5px" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted mb-3">
            Day Schedule
          </p>
          <div className="space-y-2">
            {BASECAMP_CHECKIN.schedule.map((item) => (
              <div key={item.time} className="grid grid-cols-[7rem_1fr] gap-2 text-[12px]">
                <span className="font-mono text-ink-muted whitespace-nowrap">{item.time}</span>
                <span className="text-ink">{item.event}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-ink-muted leading-relaxed">
          {BASECAMP_CHECKIN.departureTip}
        </p>
      </Section>

      <Section num="03" title="Medical recheck" id="medical">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Medical recheck clears every person for the backcountry. Philmont does
          not bend on these standards. Come prepared.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div
            className="bg-surface border border-border rounded-md p-4"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              BMI (under 21)
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bmiUnder21}
            </div>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-4"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              BMI (adults)
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bmiAdult}
            </div>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-4"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              Blood pressure max
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bpMax}
            </div>
          </div>
        </div>
        <Box variant="warn">
          <strong>{MEDICAL_STANDARDS.note}</strong>
        </Box>
        <Panel title="Requirements">
          <ul className="space-y-1.5">
            {MEDICAL_STANDARDS.medRequirements.map((req) => (
              <li key={req} className="flex items-start gap-2 text-[12px]">
                <span className="text-warn-text mt-0.5 shrink-0">▸</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-ink-muted mt-3 bg-surface-2 rounded px-3 py-2">
            Medications may be repackaged for the trail <strong className="text-ink">after</strong> med recheck is complete — not before.
          </p>
        </Panel>
        <p className="text-[12px] text-ink-muted">
          Emergency protocols and first aid references →{" "}
          <Link href="/reference/safety" className="underline hover:text-ink">
            Safety
          </Link>
        </p>
      </Section>

      <Section num="04" title="The burro" id="burro">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          The crew picks up a burro on Trail Day 7 and manages it through Trail Day 9. It carries a share of the crew&apos;s gear — and earns the same care as any crew member.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className="bg-surface border border-border rounded-md p-3"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">
              Pickup
            </div>
            <p className="text-[12px] font-medium">{TREK_LOGISTICS.burro.pickupDay}</p>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-3"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">
              Drop-off
            </div>
            <p className="text-[12px] font-medium">{TREK_LOGISTICS.burro.dropoffDay}</p>
          </div>
        </div>
        <Panel>
          <ul className="space-y-1.5">
            {TREK_LOGISTICS.burro.notes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="05" title="Trading posts" id="trading-posts">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Four trading posts along the route. Stock up on snacks, patches, and anything you&apos;ve run short on.
        </p>
        <div className="space-y-2">
          {TRADING_POSTS.map((tp) => (
            <div
              key={tp.name}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[13px] font-semibold">{tp.name}</h3>
                <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
                  {tp.when}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {tp.notes}
              </p>
              <p className="text-[11px] font-mono text-ink-muted mt-1">
                Budget: {tp.budget}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="06" title="Cell service & electronics" id="cell-service">
        <Box variant="warn">
          <strong>{TREK_LOGISTICS.cellService.summary}</strong>
        </Box>
        <Panel title="Electronics">
          <p className="text-[12px] text-ink-muted leading-relaxed mb-3">
            {TREK_LOGISTICS.electronics.summary}
          </p>
          <ul className="space-y-1.5">
            {TREK_LOGISTICS.electronics.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>
      <Section num="07" title="Food resupply" id="food-resupply">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Food is issued in buddy-pair bags at three points during the trek. Weights below are for planning — actual bag weights may vary slightly.
        </p>
        <div className="space-y-2">
          {RESUPPLY_SCHEDULE.map((stop) => (
            <div
              key={stop.stop}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[13px] font-semibold">{stop.stop}</h3>
                <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
                  {stop.uiDayLabel}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted mb-2">{stop.foodDays}</p>
              <div className="flex gap-4 mb-2">
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">Per person</div>
                  <div className="text-[16px] font-semibold font-mono">{stop.perPersonLbs} lbs</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">Buddy pair</div>
                  <div className="text-[16px] font-semibold font-mono">{stop.buddyPairTotalLbs} lbs</div>
                </div>
              </div>
              {stop.also && stop.also.length > 0 && (
                <ul className="space-y-0.5">
                  {stop.also.map((item) => (
                    <li key={item} className="text-[11px] text-ink-muted flex items-start gap-1.5">
                      <span className="shrink-0">·</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section num="08" title="Dry camp" id="dry-camp">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          One camp on this trek has no water on-site. Fill everything you&apos;re carrying before you arrive — there&apos;s no source until the next morning.
        </p>
        <Box variant="danger">
          <strong>{DRY_CAMP.camp} · {DRY_CAMP.uiDayLabel}</strong>
          <br />{DRY_CAMP.date} — {DRY_CAMP.waterSource}
        </Box>
        <Panel title="Protocol">
          <ol className="space-y-1.5">
            {DRY_CAMP.protocol.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[12px]">
                <span className="font-mono text-[10px] text-ink-muted bg-surface-2 border border-border-strong rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Section>

    </Page>
  );
}
