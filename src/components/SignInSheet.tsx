"use client";

import Link from "next/link";

export function SignInSheet({
  nextUrl,
  onDismiss,
  heading = "Want to track your actual gear?",
  body = "This is the crew's master list. Sign in to see your copy — check things off, add notes, and watch your pack weight.",
}: {
  nextUrl: string;
  onDismiss: () => void;
  heading?: string;
  body?: string;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 animate-slide-up border-t-2 border-hcblue shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: "#fff9db" /* warm hint — matches note-row highlight used throughout the app */ }}
    >
      <div className="max-w-[600px] mx-auto px-6 py-5 space-y-3">
        <div>
          <p className="font-semibold text-[14px] text-ink">{heading}</p>
          <p className="text-[13px] text-ink-muted mt-1 leading-snug">{body}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/signin?next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center px-5 py-2 rounded-md bg-hcblue text-white text-[12px] font-semibold font-mono uppercase tracking-[0.05em] hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[12px] text-ink-faint hover:text-ink-muted transition-colors font-mono"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
