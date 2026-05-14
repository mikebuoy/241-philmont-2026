import type { GpxTrack } from "@/lib/gpx";

type Props = {
  track: GpxTrack | null;
  partial?: boolean;
  partialNote?: string;
};

export function ElevationProfile({ track, partial, partialNote }: Props) {
  if (!track || track.points.length < 2) {
    return (
      <div
        className="bg-surface border border-border rounded-lg p-6 text-center"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted mb-2">
          Elevation profile
        </p>
        <p className="text-[12px] text-ink-muted">Elevation data pending</p>
        <p className="text-[11px] text-ink-faint mt-1">
          GPX file not yet available for this day.
        </p>
      </div>
    );
  }

  // Plot dimensions
  const W = 600;
  const H = 180;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const { points, cumMiles, totalMiles, bounds } = track;
  // Round ele bounds to nearest 100 ft for cleaner axis
  const eMin = Math.floor(bounds.minEleFt / 100) * 100;
  const eMax = Math.ceil(bounds.maxEleFt / 100) * 100;
  const eRange = eMax - eMin || 1;

  const toX = (mi: number) => padL + (mi / totalMiles) * plotW;
  const toY = (ft: number) => padT + plotH - ((ft - eMin) / eRange) * plotH;

  // Build path
  const d = points
    .map((p, i) => {
      const x = toX(cumMiles[i]);
      const y = toY(p.eleFt);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Fill underneath
  const fillD =
    d +
    ` L${toX(totalMiles).toFixed(1)},${(padT + plotH).toFixed(1)} L${padL},${(padT + plotH).toFixed(1)} Z`;

  // Axis ticks
  const yTicks = [eMin, eMin + Math.round(eRange / 2 / 100) * 100, eMax];
  const xTicks =
    totalMiles > 0
      ? [0, totalMiles / 2, totalMiles].map((mi) => mi)
      : [0];

  return (
    <div
      className="bg-surface border border-border rounded-lg p-3.5"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          Elevation profile
        </p>
        <p className="font-mono text-[10px] text-ink-faint">
          {bounds.minEleFt.toFixed(0)} – {bounds.maxEleFt.toFixed(0)} ft ·{" "}
          {totalMiles.toFixed(1)} mi
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        aria-label={`Elevation profile, ${totalMiles.toFixed(1)} miles from ${bounds.minEleFt.toFixed(0)} to ${bounds.maxEleFt.toFixed(0)} feet`}
      >
        {/* Y gridlines */}
        {yTicks.map((ft) => (
          <g key={ft}>
            <line
              x1={padL}
              x2={W - padR}
              y1={toY(ft)}
              y2={toY(ft)}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <text
              x={padL - 6}
              y={toY(ft)}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill="var(--color-ink-faint)"
              textAnchor="end"
              dominantBaseline="central"
            >
              {ft}
            </text>
          </g>
        ))}
        {/* X ticks */}
        {xTicks.map((mi) => (
          <g key={mi}>
            <text
              x={toX(mi)}
              y={padT + plotH + 14}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill="var(--color-ink-faint)"
              textAnchor="middle"
            >
              {mi.toFixed(1)} mi
            </text>
          </g>
        ))}
        {/* Fill */}
        <path d={fillD} fill="var(--color-surface-2)" />
        {/* Line */}
        <path
          d={d}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Start + end markers */}
        <circle
          cx={toX(0)}
          cy={toY(points[0].eleFt)}
          r="3"
          fill="var(--color-ok-text)"
        />
        <circle
          cx={toX(totalMiles)}
          cy={toY(points[points.length - 1].eleFt)}
          r="3"
          fill="var(--color-info-text)"
        />
      </svg>
      {partial && (
        <p className="text-[10px] text-ink-faint mt-2 leading-snug">
          <strong className="text-warn-text">Partial coverage.</strong>{" "}
          {partialNote}
        </p>
      )}
    </div>
  );
}
