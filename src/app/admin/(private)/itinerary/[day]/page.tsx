import Link from "next/link";
import { notFound } from "next/navigation";
import { getItinerary } from "@/lib/itinerary";
import { isoToSlug } from "@/data/itinerary";
import { saveDay } from "./actions";
import { StatusBadge } from "@/components/primitives/StatusBadge";

export const dynamic = "force-dynamic";

type Params = { day: string };

const FLAG_OPTIONS: { key: string; label: string }[] = [
  { key: "dryCamp", label: "Dry camp" },
  { key: "burroPickup", label: "Burro pickup" },
  { key: "burroDropoff", label: "Burro drop-off" },
  { key: "summit", label: "Summit" },
  { key: "conservation", label: "Conservation" },
  { key: "longestDay", label: "Longest day" },
  { key: "hardestDescent", label: "Hardest descent" },
];

export default async function EditDayPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { day: slug } = await params;
  const all = await getItinerary();
  const d = all.find((x) => isoToSlug(x.iso) === slug);
  if (!d) notFound();

  const saveAction = saveDay.bind(null, d.iso);

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <Link
        href="/admin/itinerary"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink mb-4"
      >
        ‹ Back to itinerary
      </Link>

      <header className="border-b-2 border-ink pb-4 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
          {d.weekday} · {d.dateShort}
          {d.philmontDay != null && ` · Philmont Day ${d.philmontDay}`}
        </p>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          {d.label}
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          {d.camp} · <StatusBadge tone="neutral">{d.type}</StatusBadge>
        </p>
      </header>

      <form action={saveAction} className="space-y-6">
        {/* Notes */}
        <section
          className="bg-surface border border-border rounded-lg p-4"
          style={{ borderWidth: "0.5px" }}
        >
          <label className="block">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] block mb-2">
              Notes
            </span>
            <textarea
              name="notes"
              rows={4}
              defaultValue={d.notes}
              placeholder="Notes for the crew on this day…"
              className="w-full text-[12px] bg-surface-2 border border-border rounded px-3 py-2 leading-relaxed resize-y"
            />
          </label>
        </section>

        {/* Programs */}
        <section
          className="bg-surface border border-border rounded-lg p-4"
          style={{ borderWidth: "0.5px" }}
        >
          <label className="block">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] block mb-2">
              Activities &amp; Programs
            </span>
            <p className="text-[11px] text-ink-faint mb-2">
              One per line. Order shown is the order they&apos;ll appear.
            </p>
            <textarea
              name="programs"
              rows={6}
              defaultValue={d.programs.join("\n")}
              placeholder="Ranger Training&#10;Fire Ecology &amp; Wildlife Conservation @ Cimarroncita (passthrough)"
              className="w-full text-[12px] bg-surface-2 border border-border rounded px-3 py-2 leading-relaxed resize-y font-mono"
            />
          </label>
        </section>

        {/* Flags */}
        <section
          className="bg-surface border border-border rounded-lg p-4"
          style={{ borderWidth: "0.5px" }}
        >
          <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] mb-3">
            Badges
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FLAG_OPTIONS.map((f) => {
              const checked =
                (d.flags as Record<string, boolean | undefined>)[f.key] ===
                true;
              return (
                <label
                  key={f.key}
                  className="flex items-center gap-2 text-[12px] cursor-pointer p-2 rounded hover:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    name={`flag_${f.key}`}
                    defaultChecked={checked}
                    className="accent-ink"
                  />
                  <span>{f.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* GPX */}
        <section
          className="bg-surface border border-border rounded-lg p-4 space-y-3"
          style={{ borderWidth: "0.5px" }}
        >
          <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
            GPX file
          </p>

          {d.gpx ? (
            <div className="bg-ok-bg text-ok-text rounded-md px-3 py-2 text-[11px] font-mono flex items-center justify-between gap-2">
              <span>{d.gpx.path}</span>
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gpx/${d.gpx.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                view
              </a>
            </div>
          ) : (
            <p className="text-[11px] text-ink-faint">No GPX uploaded.</p>
          )}

          <label className="block">
            <span className="text-[11px] font-medium">
              Upload new (replaces existing):
            </span>
            <input
              type="file"
              name="gpx_file"
              accept=".gpx,application/gpx+xml"
              className="mt-1.5 block w-full text-[11px] text-ink-muted file:mr-3 file:rounded file:border-0 file:bg-ink file:text-bg file:px-3 file:py-1.5 file:text-[11px] file:font-medium hover:file:opacity-90"
            />
          </label>

          <label className="flex items-center gap-2 text-[12px]">
            <input
              type="checkbox"
              name="gpx_partial"
              defaultChecked={d.gpx?.partial ?? false}
              className="accent-ink"
            />
            <span>Mark as partial coverage</span>
          </label>

          <label className="block">
            <span className="text-[11px] font-medium">Coverage note:</span>
            <input
              type="text"
              name="gpx_note"
              defaultValue={d.gpx?.note ?? ""}
              placeholder="e.g. Trail continues to Santa Claus"
              className="mt-1.5 w-full text-[12px] bg-surface-2 border border-border rounded px-3 py-2"
            />
          </label>

          {d.gpx && (
            <label className="flex items-center gap-2 text-[12px] text-danger-text">
              <input
                type="checkbox"
                name="remove_gpx"
                className="accent-ink"
              />
              <span>Remove existing GPX file on save</span>
            </label>
          )}
        </section>

        {/* Save */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-ink-faint">
            Saving rebuilds the site (~60–90 sec).
          </p>
          <button
            type="submit"
            className="bg-ink text-bg px-5 py-2.5 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Save &amp; rebuild
          </button>
        </div>
      </form>
    </div>
  );
}
