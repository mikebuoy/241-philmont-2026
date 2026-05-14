import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import { TRAINING_TIMELINE } from "@/data/training";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { Box } from "@/components/primitives/Box";

export const metadata: Metadata = { title: "Training Plan" };

const TYPE_TONE: Record<
  string,
  { label: string; tone: "info" | "ok" | "warn" | "danger" | "neutral" }
> = {
  milestone: { label: "Milestone", tone: "danger" },
  training_block: { label: "Training Block", tone: "info" },
  ongoing: { label: "Ongoing", tone: "ok" },
  taper: { label: "Taper", tone: "warn" },
};

export default function TrainingPage() {
  return (
    <Page
      eyebrow="My Trip"
      title="Training Plan"
      meta="May 16 shakedown → June 14 fly day"
    >
      <SubNav items={TRIP_SUB} />

      <Box variant="warn">
        <strong>Hydration is the most impactful single prep action.</strong>{" "}
        Start drinking 3–4 liters per day now. Body needs time to adapt to that
        volume. Train your hydration before you train your legs.
      </Box>

      <Section num="01" title="Timeline">
        <ol className="relative">
          {TRAINING_TIMELINE.map((e, i) => {
            const meta = TYPE_TONE[e.type] ?? TYPE_TONE.training_block;
            const isLast = i === TRAINING_TIMELINE.length - 1;
            return (
              <li
                key={e.id}
                className="relative pl-8 pb-5 last:pb-0"
              >
                {/* vertical line */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-3 bottom-0 w-px bg-border-strong"
                  />
                )}
                {/* dot */}
                <span
                  aria-hidden
                  className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full bg-surface border-2 border-ink"
                />
                <div
                  className="bg-surface border border-border rounded-md p-3.5"
                  style={{ borderWidth: "0.5px" }}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="font-mono text-[11px] text-ink-muted">
                      {e.dateLabel}
                    </span>
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  </div>
                  <h3 className="text-[13px] font-semibold mb-1">{e.title}</h3>
                  <p className="text-[12px] text-ink-muted leading-relaxed">
                    {e.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section num="02" title="Notes for the crew">
        <Box variant="info">
          <strong>Pack shakedown · May 16.</strong> Bring your full pack at trek
          weight. We weigh every pack. Anyone over the 25% ceiling has 29 days
          to cut weight before departure.
        </Box>
        <Box variant="ok">
          <strong>Break in your actual boots.</strong> 20–30 miles minimum
          before shakedown — wearing the same socks and inserts you'll bring on
          the trek. Don't show up in boots straight from the box.
        </Box>
        <Box variant="warn">
          <strong>Taper June 8–13.</strong> Reduce mileage. Sleep, hydrate,
          eat. No long hard hikes 2–3 days before flying out. Arrive rested.
        </Box>
      </Section>
    </Page>
  );
}
