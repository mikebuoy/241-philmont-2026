"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const LS_KEY = "hero-challenge-seen";

function HeroBody() {
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
        <p className="text-[22px] sm:text-[26px] font-bold">Let&apos;s go create amazing memories.</p>
      </div>
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

  useEffect(() => {
    if (window.location.hash === '#welcome') {
      localStorage.removeItem(LS_KEY);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setMounted(true);
    if (!localStorage.getItem(LS_KEY)) setShowOverlay(true);
  }, []);

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

  // First visit: full-screen overlay
  if (showOverlay) {
    return (
      <div className="fixed inset-0 z-[60] bg-hcblue text-white flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-12">
          <div className="max-w-[620px] mx-auto">
            <HeroHeader />
            <HeroBody />
          </div>
        </div>
        <div className="shrink-0 px-6 pb-24 sm:pb-10 pt-4 bg-hcblue">
          <div className="max-w-[620px] mx-auto">
            <button
              onClick={dismiss}
              className="w-full bg-white text-hcblue rounded-xl py-4 font-bold text-[16px] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Let&apos;s Go!
            </button>
          </div>
        </div>
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
