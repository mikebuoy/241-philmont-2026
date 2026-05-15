"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<Shell />}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const next = params.get("next") || "/";

  // If already signed in, skip straight to wherever they were going
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      }
    });
  }, [next, router]);

  return <Shell error={error} next={next} />;
}

function Shell({
  error,
  next,
}: {
  error?: string | null;
  next?: string;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}`,
      },
    });
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setEmailLoading(true);
    setEmailError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}`,
      },
    });
    setEmailLoading(false);
    if (err) {
      setEmailError(err.message);
    } else {
      setEmailSent(email);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-16">
      <header className="border-b-2 border-ink pb-4 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
          Tooth of Time · Sign in
        </p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Sign in
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          All crew members can sign in to manage their packing list.
        </p>
      </header>

      <div
        className="bg-surface border border-border rounded-lg p-5 space-y-4"
        style={{ borderWidth: "0.5px" }}
      >
        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={googleLoading || !!emailSent}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-ink text-bg rounded-md text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? "Redirecting…" : "Sign in with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
            or
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Magic email link */}
        {emailSent ? (
          <div className="bg-ok-bg text-ok-text rounded-md px-3.5 py-3 text-[12px] leading-relaxed">
            <p className="font-semibold mb-1">Check your email.</p>
            <p>
              We sent a sign-in link to{" "}
              <span className="font-mono">{emailSent}</span>. Click it to
              finish signing in. The link works in any browser.
            </p>
          </div>
        ) : (
          <form onSubmit={signInWithEmail} className="space-y-2">
            <label className="block">
              <span className="text-[12px] font-medium text-ink">
                Or sign in with email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={emailLoading}
                className="mt-1.5 w-full font-mono text-[13px] bg-surface-2 border border-border rounded px-3 py-2 disabled:opacity-50"
              />
            </label>
            <button
              type="submit"
              disabled={emailLoading || !email}
              className="w-full px-4 py-2.5 bg-hcblue text-bg rounded-md text-[12px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {emailLoading ? "Sending…" : "Send sign-in link"}
            </button>
            {emailError && (
              <p className="text-[11px] text-danger-text">{emailError}</p>
            )}
            <p className="text-[10px] text-ink-faint leading-relaxed">
              We&apos;ll email a one-tap link — no password needed.
            </p>
          </form>
        )}

        {/* Errors from upstream */}
        {error === "auth" && (
          <p className="text-[12px] text-danger-text">
            Sign-in failed. Please try again.
          </p>
        )}
        {error === "forbidden" && (
          <p className="text-[12px] text-danger-text">
            That account isn&apos;t authorized to edit. Sign in with an admin
            account.
          </p>
        )}

        <p className="text-[10px] text-ink-faint leading-relaxed pt-1">
          You&apos;ll return to the page you were on after signing in. First
          time? We&apos;ll ask you to pick your name from the roster.
        </p>
      </div>
    </div>
  );
}
