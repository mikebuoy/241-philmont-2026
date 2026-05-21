import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Install — Philmont Trek Hub",
  description:
    "Add Philmont Trek Hub to your iPhone home screen. Troop 241 · Trek 12-28 · 2026.",
  openGraph: {
    title: "Philmont Trek Hub",
    description: "Troop 241 · Trek 12-28 · 2026",
  },
};

export default function InstallPage() {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center px-6 py-16 text-center gap-8">
      <Image
        src="/tooth-icon.png"
        width={72}
        height={72}
        alt="Philmont Trek Hub"
        className="opacity-90"
      />

      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
          Philmont Trek Hub
        </h1>
        <p className="text-[14px] text-ink-muted">
          Troop 241 · Trek 12-28 · 2026
        </p>
      </div>

      <div className="max-w-[340px] space-y-3 text-left">
        <p className="text-[13px] text-ink-muted leading-relaxed text-center">
          Install the web app on your iPhone home screen — it opens full-screen, no browser chrome.
        </p>
        <ol className="space-y-2 text-[13px] text-ink-muted">
          <li className="flex gap-2">
            <span className="font-mono text-ink-faint shrink-0">1.</span>
            Open this page in <strong className="text-ink">Safari</strong>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-ink-faint shrink-0">2.</span>
            Tap <strong className="text-ink">Install Profile</strong> when prompted
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-ink-faint shrink-0">3.</span>
            Go to <strong className="text-ink">Settings → General → VPN &amp; Device Management</strong>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-ink-faint shrink-0">4.</span>
            Tap <strong className="text-ink">Install</strong> twice to confirm
          </li>
        </ol>
      </div>

      <a
        href="/install/profile"
        className="bg-hcblue text-white rounded-2xl px-10 py-4 font-semibold text-[16px] hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Install Web App
      </a>

      <p className="text-[11px] font-mono text-ink-faint uppercase tracking-wide">
        iOS · Safari only · Free
      </p>
    </div>
  );
}
