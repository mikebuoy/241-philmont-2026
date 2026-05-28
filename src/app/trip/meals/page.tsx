import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { TRIP_SUB } from "@/components/nav/navItems";
import { getItinerary } from "@/lib/itinerary";
import type { TrailMeal } from "@/lib/itinerary";

export const metadata: Metadata = { title: "Meals" };

const ALLERGEN_SUMMARY = [
  { allergen: "Wheat / Gluten",   note: "Widely present — crackers, pretzels, pasta dishes, cereals, most cookies." },
  { allergen: "Milk / Dairy",     note: "Widely present — most dinner entrées, cheese cups, granola bars, hot cocoa." },
  { allergen: "Soy",              note: "Present in several items — some granola bars, some crackers, Ramen broth." },
  { allergen: "Tree Nuts",        note: "Multiple bars and trail mix items — RXBAR, Kodiak bars, Snickerdoodle, Almond Sweet & Salty." },
  { allergen: "Peanuts",         note: "Peanut butter items in lunches, some trail mix." },
  { allergen: "Eggs",             note: "RXBAR Blueberry (Egg Whites). Some shared-facility items may contain egg traces." },
  { allergen: "Fish / Shellfish", note: "Tuna in multiple lunch items." },
];

function codeCell(meal: TrailMeal | null, note: string | null): string {
  if (meal) return meal.code;
  if (note) return note;
  return "—";
}

function MealSlot({
  label,
  meal,
  note,
}: {
  label: string;
  meal: TrailMeal | null;
  note: string | null;
}) {
  if (!meal && !note) return null;
  return (
    <div
      className="flex items-start gap-3 py-2 border-b border-border last:border-0"
      style={{ borderWidth: "0.5px" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        {meal ? (
          <>
            <span className="font-mono text-[11px] font-semibold">{meal.code}</span>
            <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
              {meal.items.join(" · ")}
            </p>
          </>
        ) : (
          <span className="text-[12px] text-ink-muted">{note}</span>
        )}
      </div>
    </div>
  );
}

export default async function MealsPage() {
  const all = await getItinerary();
  const trekDays = all.filter((d) => d.philmontDay !== null);

  return (
    <Page
      eyebrow="My Trek"
      title="Meals"
      meta="Trek meal schedule · Allergens"
    >
      <SubNav items={TRIP_SUB} />

      <Section num="01" title="Meal numbering">
        <Panel>
          <p className="text-[12px] leading-relaxed">
            Meal numbers are based on calendar date, not trek day. Every crew
            on trail eats B1/L1/D1 on the 1st, 11th, and 21st of any month.
            Numbers shift by one on August 1 so crews do not eat the same
            number on consecutive days.
          </p>
        </Panel>
        <Box variant="info">
          Full ingredient lists and allergen disclosures:{" "}
          <a
            href="https://www.philmontscoutranch.org/wp-content/uploads/2026/04/26-PSR-Trail-Menu-and-Ingredients-04.28.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            2026 PSR Trail Food Menu and Ingredients
          </a>
          . Read before arrival if you have any dietary restriction.
        </Box>
      </Section>

      <Section num="02" title="Trek meal schedule">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border" style={{ borderWidth: "0.5px" }}>
                <th className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.06em] pb-2 pr-4">Date</th>
                <th className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.06em] pb-2 pr-4">Day</th>
                <th className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.06em] pb-2 pr-4">Breakfast</th>
                <th className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.06em] pb-2 pr-4">Lunch</th>
                <th className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.06em] pb-2">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {trekDays.map((d) => (
                <tr
                  key={d.iso}
                  className="border-b border-border"
                  style={{ borderWidth: "0.5px" }}
                >
                  <td className="font-mono text-[11px] py-2 pr-4 whitespace-nowrap">
                    {d.dateShort}
                    {d.foodPickup && (
                      <span className="font-mono text-[9px] text-info-text ml-1.5">· resupply</span>
                    )}
                  </td>
                  <td className="font-mono text-[11px] py-2 pr-4 whitespace-nowrap text-ink-muted">
                    Day {d.trailDay}
                  </td>
                  <td className="font-mono text-[11px] py-2 pr-4 whitespace-nowrap">
                    {codeCell(d.breakfastMeal, d.mealBreakfastNote)}
                  </td>
                  <td className="font-mono text-[11px] py-2 pr-4 whitespace-nowrap">
                    {codeCell(d.lunchMeal, d.mealLunchNote)}
                  </td>
                  <td className="font-mono text-[11px] py-2 whitespace-nowrap">
                    {codeCell(d.dinnerMeal, d.mealDinnerNote)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="03" title="Full meal details">
        <div className="space-y-3">
          {trekDays.map((d) => (
            <div
              key={d.iso}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <span className="font-mono text-[10px] text-ink-muted">
                    Trail Day {d.trailDay} · {d.dateShort}
                  </span>
                  {d.label && (
                    <p className="text-[13px] font-semibold mt-0.5">{d.label}</p>
                  )}
                </div>
                {d.foodPickup && (
                  <StatusBadge tone="info">FOOD RESUPPLY</StatusBadge>
                )}
              </div>
              <MealSlot label="Breakfast" meal={d.breakfastMeal} note={d.mealBreakfastNote} />
              <MealSlot label="Lunch" meal={d.lunchMeal} note={d.mealLunchNote} />
              <MealSlot label="Dinner" meal={d.dinnerMeal} note={d.mealDinnerNote} />
            </div>
          ))}
        </div>
      </Section>

      <Section num="04" title="Allergen guide">
        <Panel title="Major allergens in the 2026 trail menu">
          <div className="space-y-3">
            {ALLERGEN_SUMMARY.map((a) => (
              <div key={a.allergen}>
                <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                  {a.allergen}
                </div>
                <p className="text-[12px] mt-0.5">{a.note}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Box variant="warn">
          Multiple items are produced on shared equipment with peanuts, tree
          nuts, milk, wheat, soy, or sesame. Anyone with a severe allergy must
          bring an in-date EpiPen and brief the crew before departure.
        </Box>
      </Section>
    </Page>
  );
}
