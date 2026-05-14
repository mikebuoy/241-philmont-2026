import Link from "next/link";

const GITHUB_REPO = "https://github.com/mikebuoy/241-philmont-2026";

export function Footer() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";
  const date = process.env.NEXT_PUBLIC_BUILD_DATE ?? "—";
  const isDev = sha === "dev";

  return (
    <footer className="max-w-[900px] mx-auto px-6 py-6 pb-24 sm:pb-6">
      <div className="border-t border-border pt-4 flex items-center justify-between flex-wrap gap-3">
        <p className="font-mono text-[10px] text-ink-faint">
          Trek 12-23 · Philmont 2026
        </p>
        <p className="font-mono text-[10px] text-ink-faint flex items-center gap-1.5 flex-wrap">
          <Link
            href="/admin"
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            Admin sign-in
          </Link>
          <span aria-hidden="true">·</span>
          {isDev ? (
            <span>build {sha} · {date}</span>
          ) : (
            <>
              <a
                href={`${GITHUB_REPO}/commit/${sha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink underline-offset-2 hover:underline"
              >
                {sha}
              </a>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
