"use client";
import { useEffect, useRef, useState } from "react";

const LS_KEY = "pwa-banner-dismissed-until";
const DELAY_MS = 30_000;

export function PWAInstallBanner() {
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [visible, setVisible] = useState(false);
  const [animated, setAnimated] = useState(false);
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    if (
      matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone
    ) return;

    const until = localStorage.getItem(LS_KEY);
    if (until && Date.now() < +until) return;

    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    if (!isIOS && !isAndroid) return;

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    const handleInstalled = () => dismiss();

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    setPlatform(isIOS ? "ios" : "android");

    const timer = setTimeout(() => {
      if (isAndroid && !deferredPrompt.current) return;
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setAnimated(false);
    setTimeout(() => setVisible(false), 300);
    localStorage.setItem(LS_KEY, String(Date.now() + 14 * 24 * 60 * 60 * 1000));
  }

  async function handleInstall() {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    dismiss();
  }

  if (!visible || !platform) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[55] transition-transform duration-300 ease-out ${
        animated ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        className="bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-5 pt-4"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt=""
            width={40}
            height={40}
            className="rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-ink leading-tight">
              Add to your home screen
            </p>
            <p className="text-[13px] text-ink-muted mt-0.5">
              {platform === "android"
                ? "No App Store needed — works like a real app!"
                : "Install it in two quick steps."}
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="text-ink-faint hover:text-ink p-1 -mt-1 -mr-1 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="border-t border-border my-3" />

        {/* Android: install button */}
        {platform === "android" && (
          <button
            onClick={handleInstall}
            className="w-full bg-hcblue text-white rounded-full py-2.5 font-semibold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Install
          </button>
        )}

        {/* iOS: step-by-step instructions */}
        {platform === "ios" && (
          <ol className="space-y-2 text-[13px] text-ink-muted">
            <li className="flex gap-2">
              <span className="shrink-0 font-mono text-[11px] text-ink-faint pt-px">1.</span>
              <span>
                Tap the{" "}
                <ShareIcon />{" "}
                Share button at the bottom of Safari.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-mono text-[11px] text-ink-faint pt-px">2.</span>
              <span>Scroll down and tap <strong className="text-ink font-medium">&ldquo;Add to Home Screen.&rdquo;</strong></span>
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block align-middle mx-0.5 -mt-0.5 text-ink"
    >
      <polyline points="8 6 12 2 16 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
      <path d="M20 21H4a1 1 0 01-1-1V10a1 1 0 011-1h4" />
      <path d="M16 9h4a1 1 0 011 1v10a1 1 0 01-1 1" />
    </svg>
  );
}
