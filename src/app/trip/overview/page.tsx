import type { Metadata } from "next";
import Image from "next/image";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import {
  BIG_PICTURE,
  ARROWHEAD_REQUIREMENTS,
} from "@/data/trek";

export const metadata: Metadata = { title: "Trek Overview" };

export default function TrekOverviewPage() {
  return (
    <Page
      eyebrow="My Trek"
      title="Trek"
      meta="Crew · Arrowhead · Logistics"
    >
      <SubNav items={TRIP_SUB} />

      <Section num="01" title="Trek overview">
        <div className="space-y-2">
          <p className="text-[14px] font-semibold leading-snug">{BIG_PICTURE.headline}</p>
          <p className="text-[12px] text-ink-muted leading-relaxed">{BIG_PICTURE.activities}</p>
        </div>
        <Panel title="The way we succeed">
          <ul className="space-y-1.5">
            {BIG_PICTURE.crewCode.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="02" title="The Philmont experience">
        <div
          className="relative w-full aspect-video rounded-md overflow-hidden border border-border"
          style={{ borderWidth: "0.5px" }}
        >
          <iframe
            src="https://www.youtube.com/embed/fqORbB2BiEQ?si=8RXV57avggqmzRre"
            title="The Philmont Experience"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </Section>

      <Section num="03" title="Earn The Arrowhead Award">
        <Panel>
          <div className="clearfix">
            <Image
              src="/images/philmont-arrowhead.png"
              alt="Philmont Arrowhead Award"
              width={120}
              height={147}
              className="object-contain block float-right ml-4 mb-1"
            />
            <ul className="space-y-1.5">
              {ARROWHEAD_REQUIREMENTS.map((req) => (
                <li key={req} className="flex items-start gap-2 text-[12px]">
                  <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <Box variant="warn">
          <strong>Missing conservation = no Arrowhead.</strong> Conservation is
          Day 8 at Sioux at 2:00 PM. A late start on Day 8 puts the whole day
          at risk.
        </Box>
      </Section>

    </Page>
  );
}
