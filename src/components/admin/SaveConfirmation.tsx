"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Banner that appears briefly after an admin save redirects to the
 * public version of the edited page. Reads ?saved=1 from the URL;
 * auto-dismisses after 8 seconds. Manual ✕ also closes it.
 */
export function SaveConfirmation() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialSaved = params.get("saved") === "1";
  const [visible, setVisible] = useState(initialSaved);

  useEffect(() => {
    if (!initialSaved) return;
    const timer = setTimeout(() => {
      setVisible(false);
      // Clean the query param so a refresh doesn't re-show the banner
      router.replace(pathname, { scroll: false });
    }, 8000);
    return () => clearTimeout(timer);
  }, [initialSaved, pathname, router]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    router.replace(pathname, { scroll: false });
  }

  return (
    <div
      className="bg-ok-bg text-ok-text rounded-lg p-3 mb-3 flex items-start gap-3"
      style={{ borderLeft: "3px solid var(--color-ok-border)" }}
      role="status"
      aria-live="polite"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold">Saved.</p>
        <p className="text-[11px] opacity-90 mt-0.5">
          Public site rebuilding — most visitors will see your changes in
          ~60 seconds.
        </p>
      </div>
      <button
        onClick={dismiss}
        className="text-[14px] leading-none px-1 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
