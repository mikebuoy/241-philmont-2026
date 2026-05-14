import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import { ITINERARY } from "@/data/itinerary";
import { ItineraryCard } from "@/components/ItineraryCard";

export const metadata: Metadata = { title: "Itinerary" };

export default function ItineraryPage() {
  const preTrek = ITINERARY.filter((d) => d.philmontDay === null);
  const onTrek = ITINERARY.filter((d) => d.philmontDay !== null);

  return (
    <Page
      eyebrow="My Trip"
      title="Itinerary"
      meta="June 14 – 27, 2026 · 14 days · 81 miles"
    >
      <SubNav items={TRIP_SUB} />

      <Box variant="info">
        <strong>Per-day distance and elevation in P1.</strong> Phase 1 shows the
        full plan with critical flags. Trail metrics and per-day elevation
        profiles arrive next.
      </Box>

      <Section num="01" title="Pre-trek · arrival">
        <div className="space-y-2">
          {preTrek.map((d) => (
            <ItineraryCard key={d.iso} day={d} />
          ))}
        </div>
      </Section>

      <Section num="02" title="On the ranch · 12 days">
        <div className="space-y-2">
          {onTrek.map((d) => (
            <ItineraryCard key={d.iso} day={d} />
          ))}
        </div>
      </Section>
    </Page>
  );
}
