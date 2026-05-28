import Link from "next/link";
import { notFound } from "next/navigation";
import { getItinerary } from "@/lib/itinerary";
import { isoToSlug } from "@/data/itinerary";
import type { CampType } from "@/data/itinerary";
import { saveDay } from "./actions";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SaveButton } from "@/components/admin/SaveButton";

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

const CAMP_TYPE_OPTIONS: { value: CampType; label: string }[] = [
  { value: "travel", label: "Travel" },
  { value: "acclimation", label: "Acclimation" },
  { value: "base", label: "Base" },
  { value: "trail", label: "Trail" },
  { value: "staffed", label: "Staffed" },
  { value: "dry", label: "Dry Camp" },
  { value: "layover", label: "Layover" },
];

const INPUT_CLASS =
  "w-full text-[12px] bg-surface-2 border border-border rounded px-3 py-2";
const TEXTAREA_CLASS = `${INPUT_CLASS} leading-relaxed resize-y`;
const MONO_TEXTAREA_CLASS = `${TEXTAREA_CLASS} font-mono`;
const READ_ONLY_CLASS =
  "min-h-[35px] w-full text-[12px] bg-bg border border-border rounded px-3 py-2 text-ink-muted whitespace-pre-wrap";

function lines(value: string[]) {
  return value.join("\n");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] block mb-2">
      {children}
    </span>
  );
}

function ReadOnlyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={`${READ_ONLY_CLASS} ${mono ? "font-mono" : ""}`}>
        {value === null || value === undefined || value === "" ? "—" : value}
      </div>
    </div>
  );
}

function LightText({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] text-ink">{value || "—"}</dd>
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string | null | undefined;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  step = "1",
}: {
  label: string;
  name: string;
  defaultValue: number | null | undefined;
  step?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ""}
        step={step}
        className={`${INPUT_CLASS} font-mono`}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 4,
  mono = false,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      {hint && <p className="text-[11px] text-ink-faint mb-2">{hint}</p>}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={mono ? MONO_TEXTAREA_CLASS : TEXTAREA_CLASS}
      />
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="bg-surface border border-border rounded-lg p-4 space-y-4"
      style={{ borderWidth: "0.5px" }}
    >
      <h2 className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

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
        <FormSection title="Day identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Label" name="label" defaultValue={d.label} required />
            <TextField label="Camp / location" name="camp" defaultValue={d.camp} required />
            <TextField label="Food pickup" name="food_pickup" defaultValue={d.foodPickup} />
            <label className="block">
              <FieldLabel>Camp type</FieldLabel>
              <select
                name="type"
                defaultValue={d.type}
                className={INPUT_CLASS}
                required
              >
                {CAMP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </FormSection>

        <FormSection title="Trail metrics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumberField
              label="Miles"
              name="miles"
              defaultValue={d.miles}
              step="0.1"
            />
            <NumberField label="Camp elev ft" name="elevation" defaultValue={d.elevation} />
            <NumberField label="Gain ft" name="gain" defaultValue={d.gain} />
            <NumberField label="Loss ft" name="loss" defaultValue={d.loss} />
          </div>
        </FormSection>

        <FormSection title="Schedule and light">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <LightText label="Civil twilight" value={d.twilight} />
            <LightText label="Sunrise" value={d.sunrise} />
            <LightText label="Sunset" value={d.sunset} />
            <LightText label="Dark" value={d.dark} />
          </dl>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Wake" name="wake" defaultValue={d.wake} />
            <TextField label="On trail" name="on_trail" defaultValue={d.onTrail} />
          </div>
        </FormSection>

        <FormSection title="Narrative">
          <TextAreaField
            label="What to expect"
            name="what_to_expect"
            defaultValue={d.whatToExpect}
            rows={5}
          />
          <TextAreaField
            label="Note"
            name="schedule_note"
            defaultValue={d.scheduleNote ?? ""}
            rows={3}
          />
        </FormSection>

        <FormSection title="Activities and programs">
          <TextAreaField
            label="Planned activities"
            name="planned_activities"
            defaultValue={lines(d.plannedActivities)}
            rows={6}
            mono
            hint="One per line. These appear before programs."
          />
          <TextAreaField
            label="Programs"
            name="programs"
            defaultValue={lines(d.programs)}
            rows={5}
            mono
            hint="One per line. Order shown is the order they'll appear."
          />
          <TextAreaField
            label="Opportunities"
            name="opportunistic_activities"
            defaultValue={lines(d.opportunisticActivities)}
            rows={4}
            mono
            hint="One per line. These appear under Opportunities."
          />
        </FormSection>

        <FormSection title="Meals">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReadOnlyField label="Breakfast code" value={d.mealBreakfast} mono />
            <ReadOnlyField label="Lunch code" value={d.mealLunch} mono />
            <ReadOnlyField label="Dinner code" value={d.mealDinner} mono />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextAreaField
              label="Breakfast note"
              name="meal_breakfast_note"
              defaultValue={d.mealBreakfastNote ?? ""}
              rows={3}
            />
            <TextAreaField
              label="Lunch note"
              name="meal_lunch_note"
              defaultValue={d.mealLunchNote ?? ""}
              rows={3}
            />
            <TextAreaField
              label="Dinner note"
              name="meal_dinner_note"
              defaultValue={d.mealDinnerNote ?? ""}
              rows={3}
            />
          </div>
        </FormSection>

        <FormSection title="Crew notes">
          <TextAreaField
            label="Crew notes"
            name="crew_notes"
            defaultValue={lines(d.crewNotes)}
            rows={5}
            mono
            hint="One per line."
          />
          <TextAreaField
            label="Crew leader watch"
            name="crew_leader_watch"
            defaultValue={lines(d.crewLeaderWatch)}
            rows={5}
            mono
            hint="One per line."
          />
          <TextAreaField
            label="Crew leader focus"
            name="crew_leader_focus"
            defaultValue={d.crewLeaderFocus}
            rows={4}
          />
        </FormSection>

        {/* Flags */}
        <FormSection title="Badges">
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
        </FormSection>

        {/* GPX */}
        <FormSection title="GPX file">
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
        </FormSection>

        {/* Cancel + Save */}
        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <p className="text-[11px] text-ink-faint">
            Saving rebuilds the site (~60–90 sec).
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/trip/itinerary/${isoToSlug(d.iso)}`}
              className="text-[12px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-md hover:bg-surface-2 transition-colors"
            >
              Cancel
            </Link>
            <SaveButton />
          </div>
        </div>
      </form>
    </div>
  );
}
