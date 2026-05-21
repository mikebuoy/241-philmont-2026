import Link from "next/link";
import Image from "next/image";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Stat } from "@/components/primitives/Stat";
import { TREK_META } from "@/data/meta";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName: string | null = null;
  if (user) {
    const me = await getMyCrewMember();
    if (me) firstName = me.name.split(" ")[0];
  }

  const greeting = firstName ? `Welcome, ${firstName}` : "Welcome, crew";

  return (
    <Page
      eyebrow={`Trek ${TREK_META.trekNumber} · ${TREK_META.classification}`}
      title="Philmont 2026"
      meta={`${TREK_META.troop} · ${TREK_META.flyDate} – ${TREK_META.trailEndDate} · ${TREK_META.distanceMiles} miles`}
    >
      <Section num="00" title="Trip at a glance">
        <div className="grid grid-cols-3 gap-2">
          <Stat value={TREK_META.distanceMiles} label="MILES" />
          <Stat value={TREK_META.trailDays} label="TRAIL DAYS" />
          <Stat value="22" label="TOTAL CREW" />
          <Stat
            value={TREK_META.highestPoint.elevation.toLocaleString()}
            label={`HIGH POINT · ${TREK_META.highestPoint.name.toUpperCase()}`}
            tone="gain"
          />
          <Stat
            value={TREK_META.totalElevationGain.toLocaleString()}
            label="TOTAL GAIN (FT)"
            tone="gain"
          />
          <Stat
            value={TREK_META.totalElevationLoss.toLocaleString()}
            label="TOTAL LOSS (FT)"
            tone="loss"
          />
        </div>
        <div className="-mx-6 bg-ink text-bg px-6 py-10 sm:py-14 mt-3 rounded-2xl">
          <div className="max-w-[620px] mx-auto">

            {/* Icon + title */}
            <div className="flex flex-col items-center text-center mb-8">
              <Image
                src="/tooth-icon.png"
                width={56}
                height={56}
                alt=""
                className="mb-5 opacity-80"
              />
              <h2 className="font-condensed text-[28px] sm:text-[36px] font-bold uppercase tracking-[0.02em] leading-tight">
                The Challenge.<br />The Accomplishment.
              </h2>
            </div>

            {/* Body */}
            <div className="space-y-4 text-[14px] sm:text-[15px] leading-relaxed">
              <p className="text-[18px] sm:text-[21px] font-semibold leading-snug">
                You are going to climb more than Mount Everest.
              </p>
              <p className="opacity-75">
                Over 11 trail days, your crew will climb about 35,000 feet. Mount Everest is 29,032 feet tall. That means your legs will climb the height of Everest, keep going another 6,000 feet, then descend 35,650 feet back down the trail.
              </p>
              <p className="text-[16px] font-semibold">This is not just a backpacking trip.</p>
              <p className="text-[16px] font-semibold">This is a rite of passage.</p>
              <p className="opacity-75">
                You will leave home as Scouts. You will come back stronger, tougher, and more confident young men.
              </p>
              <p className="opacity-75">
                The trail will test your legs, your lungs, your attitude, and your ability to work as a crew. There will be days when you are tired. Days when the pack feels heavy. Days when the climb feels bigger than you expected.
              </p>
              <p className="text-[16px] font-bold">That is the point.</p>
              <p className="opacity-75">
                Every hard mile is shaping you. Every climb is building grit. Every decision to keep moving is teaching you who you are becoming.
              </p>
              <p className="font-mono text-[12px] opacity-50 tracking-wide uppercase">
                Train now. Show up ready. Carry your weight. Help your crew.
              </p>
              <div className="pt-5 border-t border-white/15 space-y-2">
                <p className="text-[16px] font-semibold opacity-85">The mountain will ask a lot from you.</p>
                <p className="text-[22px] sm:text-[26px] font-bold">Be ready to answer.</p>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* Welcome + nav chicklets */}
      <section>
        <div className="mb-5">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
            {greeting}
          </h2>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Trek {TREK_META.trekNumber} &middot; Tooth of Time &middot;{" "}
            {TREK_META.flyDate} &ndash; {TREK_META.trailEndDate}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NavCard
            href="/trip/itinerary"
            title="My Trip"
            description="Daily itinerary and training plan"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="14" x2="8" y2="14" />
                <line x1="12" y1="14" x2="12" y2="14" />
                <line x1="16" y1="14" x2="16" y2="14" />
                <line x1="8" y1="18" x2="8" y2="18" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
            }
          />
          <NavCard
            href="/pack/gear"
            title="My Pack"
            description="Gear list, food and pack weight"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            }
          />
          <NavCard
            href="/crew/roster"
            title="My Crew"
            description="Roster and duty schedule"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <NavCard
            href="/reference/gear"
            title="Reference"
            description="Gear specs, cooking and safety"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="12" y1="7" x2="16" y2="7" />
                <line x1="12" y1="11" x2="16" y2="11" />
              </svg>
            }
          />
        </div>
      </section>
    </Page>
  );
}

function NavCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 hover:bg-surface-2 hover:border-border-strong active:scale-[0.98] transition-all"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-8 h-8 text-ink-muted group-hover:text-ink transition-colors">
          {icon}
        </div>
        <svg
          className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink-muted transition-colors mt-0.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div>
        <div className="font-semibold text-[14px] leading-snug">{title}</div>
        <div className="text-ink-muted text-[11px] mt-0.5 leading-snug">{description}</div>
      </div>
    </Link>
  );
}
