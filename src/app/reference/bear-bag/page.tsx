import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import { SMELLABLES } from "@/data/safety";

export const metadata: Metadata = { title: "Bear Bag" };

export default function BearBagPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Bear Bag & Smellables"
      meta="What goes in. What's prohibited."
    >
      <SubNav items={REFERENCE_SUB} />

      <Box variant="danger">
        <strong>Deodorant is not allowed in the Philmont backcountry.</strong>{" "}
        Philmont ranger staff will check. This is not a suggestion.
      </Box>

      <Section num="01" title="Required in bear bag · every night">
        <Panel>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
            {SMELLABLES.requiredInBearBag.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-[12px]"
              >
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="02" title="Prohibited in backcountry">
        <Panel>
          <ul className="space-y-1.5">
            {SMELLABLES.prohibitedInBackcountry.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-[12px]"
              >
                <span className="text-danger-text mt-0.5 shrink-0">✕</span>
                <span className="font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="03" title="The rule">
        <Box variant="warn">
          <strong>If it has a scent or could attract an animal, it goes in
          the bear bag.</strong> When in doubt, hang it. {SMELLABLES.note}
        </Box>
      </Section>

      <Section num="04" title="Bear hang system">
        <Panel>
          <ul className="space-y-2 text-[12px]">
            <li>
              <strong className="text-ink">Ropes.</strong>{" "}
              <span className="text-ink-muted">
                Two issued ropes — 100 ft × ¼" nylon. <strong>¼" diameter mandatory.</strong>{" "}
                No Dyneema substitution. This is a Philmont spec.
              </span>
            </li>
            <li>
              <strong className="text-ink">Bags.</strong>{" "}
              <span className="text-ink-muted">
                4 woven polypropylene bags issued at HQ. Distributed across the
                crew to balance loads.
              </span>
            </li>
            <li>
              <strong className="text-ink">Carabiners.</strong>{" "}
              <span className="text-ink-muted">
                Locking, climbing-rated. Crew-supplied — Philmont does not issue
                these.
              </span>
            </li>
            <li>
              <strong className="text-ink">Timing.</strong>{" "}
              <span className="text-ink-muted">
                Hang every smellable before crew sleeps. Last duty of the day —
                everyone helps.
              </span>
            </li>
          </ul>
        </Panel>
      </Section>
    </Page>
  );
}
