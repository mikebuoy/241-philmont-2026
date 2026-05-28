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
  FIFTY_MILER_REQUIREMENTS,
} from "@/data/trek";
import { LNT_AREAS } from "@/data/incamp";

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
        <p className="text-[12px] text-ink-muted leading-relaxed">
          The Philmont Arrowhead is one of the most recognized awards in Scouting — earned only by those who complete a full Philmont backcountry trek and meet every standard along the way. Not everyone who goes to Philmont earns it. We will.
        </p>
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

      <Section num="04" title="Wilderness Pledge">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          The Wilderness Pledge is how Philmont protects its land. Every crew member takes it before entering the backcountry and is expected to live it every day on trail. It is not a formality — it is the standard.
        </p>
        <Panel title="5 areas">
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

      <Section num="05" title="BSA 50-Miler Award">
        <p className="text-[12px] text-ink-muted leading-relaxed">
          Our trek is 81 miles — enough to qualify every crew member for the BSA 50-Miler Award. This is a national Scouting recognition for completing a 50-mile journey under human power with a conservation project. We will earn it on this trek.
        </p>
        <Panel>
          <div className="clearfix">
            <Image
              src="/images/bsa-50-miler.jpg"
              alt="BSA 50-Miler Award patch"
              width={120}
              height={92}
              className="object-contain block float-right ml-4 mb-1"
            />
            <ul className="space-y-1.5">
              {FIFTY_MILER_REQUIREMENTS.map((req) => (
                <li key={req} className="flex items-start gap-2 text-[12px]">
                  <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <Box variant="ok">
          <strong>We already meet the requirements.</strong> 81 miles of hiking, a conservation project on Day 8, and a trip log. The application goes through the unit after we return.
        </Box>
      </Section>

    </Page>
  );
}
