export default function OfflinePage() {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">No connection</p>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">You&apos;re offline</h1>
      <p className="text-[14px] text-ink-muted max-w-[300px] leading-relaxed">
        Connect to the internet to access your trek info.
      </p>
    </div>
  );
}
