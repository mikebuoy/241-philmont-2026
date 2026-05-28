import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import { NAVIGATION_RULES } from "@/data/ontrail";

export const metadata: Metadata = { title: "Navigation" };

export default function NavigationPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Navigation"
      meta="Map · Compass · Route"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Navigation">
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
    </Page>
  );
}
