"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Footer "Admin sign-in" link. Captures the current page URL as
 * ?next=<path> so sign-in returns the user exactly where they were.
 */
export function AdminSignInLink() {
  return (
    <Suspense fallback={<FallbackLink />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const pathname = usePathname();
  const params = useSearchParams();
  // Preserve query string so user lands on the exact page they were on
  const qs = params.toString();
  const fullPath = qs ? `${pathname}?${qs}` : pathname;
  const href = `/admin/signin?next=${encodeURIComponent(fullPath)}`;
  return (
    <Link
      href={href}
      className="hover:text-ink underline-offset-2 hover:underline"
    >
      Sign in
    </Link>
  );
}

function FallbackLink() {
  return (
    <Link
      href="/admin/signin"
      className="hover:text-ink underline-offset-2 hover:underline"
    >
      Sign in
    </Link>
  );
}
