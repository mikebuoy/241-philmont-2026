"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const LS_KEY = "hero-challenge-seen";

type AnimPhase =
  | "idle"
  | "logo-hold"
  | "logo-out"
  | "hero-s1"
  | "hero-s2"
  | "hero-shrink"
  | "content-in"
  | "done";

function HeroBody({ sentinelRef }: { sentinelRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="space-y-4 text-[14px] sm:text-[15px] leading-relaxed">
      <p className="text-[18px] sm:text-[21px] font-semibold leading-snug">
        You are going to climb more than Mount Everest.
      </p>
      <p className="opacity-75">
        Over 11 trail days, your crew will climb about <strong className="font-bold">35,000 feet</strong>. Everest is <strong className="font-bold">29,032 feet</strong> tall.
      </p>
      <p className="opacity-75">
        That means your legs will climb Everest, keep going, then descend <strong className="font-bold">35,650 feet</strong> back down the trail.
      </p>
      <p className="opacity-75">
        This will be an incredible adventure. Big views, wild country, campfires, program activities, crew challenges, hard climbs, and stories you will remember for the rest of your life.
      </p>
      <p className="text-[16px] font-semibold">But it is also more than an adventure.</p>
      <p className="text-[16px] font-semibold">It is a rite of passage.</p>
      <p className="opacity-75">
        You will leave as Scouts and come back stronger, tougher, more confident young men.
      </p>
      <p className="opacity-75">
        Some days will be hard. That is part of what makes it worth doing.
      </p>
      <p className="text-[16px] font-semibold">You are fully capable of this.</p>
      <p className="opacity-75">
        And you will not do it alone. Your crew will do it together. You will encourage each other, carry your own weight, help when someone needs it, and keep moving as a team.
      </p>
      <p className="text-[16px] font-semibold">That is the commitment.</p>
      <p className="font-mono text-[12px] opacity-50 tracking-wide uppercase">
        Train now. Show up ready. Trust your crew. Do your part.
      </p>
      <div className="pt-5 border-t border-white/15">
        <p className="text-[22px] sm:text-[26px] font-bold text-center">Let&apos;s go create amazing memories.</p>
      </div>
      <div className="flex justify-center pt-8">
        <Image src="/PSR_Bull_Logo.png" width={180} height={90} alt="Philmont" className="opacity-80" />
      </div>
      {sentinelRef && <div ref={sentinelRef} />}
    </div>
  );
}

function HeroHeader() {
  return (
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
  );
}

export function HeroChallenge() {
  const [mounted, setMounted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === '#welcome') {
      localStorage.removeItem(LS_KEY);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setMounted(true);
    if (!localStorage.getItem(LS_KEY)) setShowOverlay(true);
  }, []);

  // Drive the animation sequence when the overlay is shown
  useEffect(() => {
    if (!showOverlay) return;
    setCanDismiss(false);
    setAnimPhase("logo-hold");           // logo pops instantly
    const timers = [
      setTimeout(() => setAnimPhase("logo-out"),    1500), // hold 1.5s, then fade
      setTimeout(() => setAnimPhase("hero-s1"),     2000), // +500ms: heading visible, S1 fades in
      setTimeout(() => setAnimPhase("hero-s2"),     2500), // +500ms: S2 fades in
      setTimeout(() => setAnimPhase("hero-shrink"), 3000), // +500ms (scale down)
      setTimeout(() => setAnimPhase("content-in"),  3700), // +700ms (rest slides up)
      setTimeout(() => setAnimPhase("done"),        4200), // +500ms — scroll unlocks
      setTimeout(() => setCanDismiss(true),         6100), // button appears at 6.1s
    ];
    return () => timers.forEach(clearTimeout);
  }, [showOverlay]);

  function dismiss() {
    localStorage.setItem(LS_KEY, "1");
    setShowOverlay(false);
  }

  // SSR / pre-hydration: render inline box so layout doesn't shift
  if (!mounted) {
    return (
      <div className="-mx-6 sm:mx-0 bg-hcblue text-white px-6 py-10 sm:py-14 rounded-2xl mx-[10px]">
        <div className="max-w-[620px] mx-auto">
          <HeroHeader />
          <HeroBody />
        </div>
      </div>
    );
  }

  // First visit: animated full-screen overlay
  if (showOverlay) {
    const heroVisible  = animPhase !== "idle" && animPhase !== "logo-hold";
    const heroLarge    = animPhase === "logo-out" || animPhase === "hero-s1" || animPhase === "hero-s2";
    const s1Visible    = animPhase !== "idle" && animPhase !== "logo-hold" && animPhase !== "logo-out";
    const s2Visible    = s1Visible && animPhase !== "hero-s1";
    const restVisible  = animPhase === "content-in" || animPhase === "done";

    return (
      <div className="fixed inset-0 z-[60] bg-hcblue text-white flex flex-col overflow-x-hidden">

        {/* [A] PSR Bull Logo — pops in instantly, fades out */}
        {(animPhase === "logo-hold" || animPhase === "logo-out") && (
          <div
            className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none ${
              animPhase === "logo-out" ? "opacity-0 transition-opacity duration-700 ease-in-out" : "opacity-100"
            }`}
          >
            <Image src="/PSR_Bull_Logo.png" width={280} height={140} alt="Philmont" className="opacity-90" />
          </div>
        )}

        {/* [B] Scrollable content — locked during animation, unlocked at done */}
        <div
          ref={scrollRef}
          className={`flex-1 px-6 py-12 ${animPhase === "done" ? "overflow-y-auto" : "overflow-hidden"}`}
        >
          <div className="max-w-[620px] mx-auto text-center">

            {/* [B1] Hero section: scales from 1.15× down to 1× */}
            <div
              className={`transition-all duration-700 ease-out origin-top text-[14px] sm:text-[15px] leading-relaxed ${
                heroVisible ? "opacity-100" : "opacity-0"
              } ${heroLarge ? "scale-[1.15]" : "scale-100"}`}
            >
              <HeroHeader />
              <p className={`text-[18px] sm:text-[21px] font-semibold leading-snug mb-4 transition-opacity duration-500 ${s1Visible ? "opacity-100" : "opacity-0"}`}>
                You are going to climb more than Mount Everest.
              </p>
              <p className={`transition-opacity duration-500 ${s2Visible ? "opacity-75" : "opacity-0"}`}>
                Over 11 trail days, your crew will climb about <strong className="font-bold">35,000 feet</strong>. Everest is <strong className="font-bold">29,032 feet</strong> tall.
              </p>
            </div>

            {/* [B2] Remaining content — slides up from below */}
            <div
              className={`transition-all duration-500 ease-out space-y-4 text-[14px] sm:text-[15px] leading-relaxed mt-4 ${
                restVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <p className="opacity-75">
                That means your legs will climb Everest, keep going, then descend <strong className="font-bold">35,650 feet</strong> back down the trail.
              </p>
              <p className="opacity-75">
                This will be an incredible adventure. Big views, wild country, campfires, program activities, crew challenges, hard climbs, and stories you will remember for the rest of your life.
              </p>
              <p className="text-[16px] font-semibold">But it is also more than an adventure.</p>
              <p className="text-[16px] font-semibold">It is a rite of passage.</p>
              <p className="opacity-75">
                You will leave as Scouts and come back stronger, tougher, more confident young men.
              </p>
              <p className="opacity-75">
                Some days will be hard. That is part of what makes it worth doing.
              </p>
              <p className="text-[16px] font-semibold">You are fully capable of this.</p>
              <p className="opacity-75">
                And you will not do it alone. Your crew will do it together. You will encourage each other, carry your own weight, help when someone needs it, and keep moving as a team.
              </p>
              <p className="text-[16px] font-semibold">That is the commitment.</p>
              <p className="font-mono text-[12px] opacity-50 tracking-wide uppercase">
                Train now. Show up ready. Trust your crew. Do your part.
              </p>
              <div className="pt-5 border-t border-white/15">
                <p className="text-[22px] sm:text-[26px] font-bold text-center">Let&apos;s go create amazing memories.</p>
              </div>
              <div className="flex justify-center pt-8 pb-4">
                <Image src="/PSR_Bull_Logo.png" width={180} height={90} alt="Philmont" className="opacity-80" />
              </div>
              <div ref={sentinelRef} />
            </div>

          </div>
        </div>

        {/* [C] Let's Go button bar — hidden until 6.1s */}
        {canDismiss && (
          <div className="shrink-0 relative">
            <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-hcblue pointer-events-none" />
            <div className="px-6 pb-24 sm:pb-10 pt-4">
              <div className="max-w-[620px] mx-auto">
                <button
                  onClick={dismiss}
                  className="w-full bg-white text-hcblue rounded-xl py-4 font-bold text-[16px] transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Let&apos;s Go!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Return visits: accordion
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="block -mx-6 sm:mx-0 mx-[10px] rounded-2xl bg-hcblue text-white overflow-hidden text-left"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/tooth-icon.png" width={56} height={56} alt="" className="opacity-80 shrink-0" />
            <span className="font-condensed text-[18px] font-bold uppercase tracking-[0.02em] leading-tight">
              The Challenge.<br />The Accomplishment.
            </span>
          </div>
          <div className="relative">
            <p className="text-[13px] opacity-60 leading-relaxed line-clamp-2">
              You are going to climb more than Mount Everest. Over 11 trail days, your crew will climb about 35,000 feet. Everest is 29,032 feet tall. That means your legs will climb Everest, keep going, then descend 35,650 feet back down the trail.
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-hcblue to-transparent" />
          </div>
          <p className="font-mono text-[10px] opacity-80 tracking-wide uppercase">
            Read the full story ↓
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="-mx-6 sm:mx-0 bg-hcblue text-white px-6 py-10 sm:py-14 rounded-2xl mx-[10px]">
      <div className="max-w-[620px] mx-auto">
        <HeroHeader />
        <HeroBody />
        <button
          onClick={() => setExpanded(false)}
          className="font-mono text-[11px] uppercase opacity-60 hover:opacity-100 transition-opacity mt-6 block"
        >
          ↑ Close
        </button>
      </div>
    </div>
  );
}
