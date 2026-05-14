import type { GpxTrack } from "@/lib/gpx";

type Props = {
  track: GpxTrack | null;
  partial?: boolean;
  partialNote?: string;
};

export function RouteMap({ track, partial, partialNote }: Props) {
  if (!track || track.points.length < 2) {
    return (
      <div
        className="bg-surface border border-border rounded-lg p-6 text-center"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted mb-2">
          Route map
        </p>
        <p className="text-[12px] text-ink-muted">Map data pending</p>
        <p className="text-[11px] text-ink-faint mt-1">
          GPX file not yet available for this day.
        </p>
      </div>
    );
  }

  const W = 600;
  const H = 360;
  const pad = 20;
  const { points, bounds } = track;

  // Aspect-correct projection. At ~36° N, 1° lon ≈ cos(36°) × 1° lat.
  const cosLat = Math.cos((bounds.minLat + bounds.maxLat) / 2 * Math.PI / 180);
  const latSpan = bounds.maxLat - bounds.minLat || 1e-6;
  const lonSpan = (bounds.maxLon - bounds.minLon) * cosLat || 1e-6;
  // Pick scale so the larger span fits.
  const availW = W - 2 * pad;
  const availH = H - 2 * pad;
  const scale = Math.min(availW / lonSpan, availH / latSpan);
  const renderedW = lonSpan * scale;
  const renderedH = latSpan * scale;
  const offsetX = pad + (availW - renderedW) / 2;
  const offsetY = pad + (availH - renderedH) / 2;

  const toX = (lon: number) =>
    offsetX + (lon - bounds.minLon) * cosLat * scale;
  // SVG y is inverted (top-down); lat increases northward, so flip
  const toY = (lat: number) =>
    offsetY + (bounds.maxLat - lat) * scale;

  const d = points
    .map((p, i) => {
      const x = toX(p.lon);
      const y = toY(p.lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const start = points[0];
  const end = points[points.length - 1];

  return (
    <div
      className="bg-surface border border-border rounded-lg p-3.5"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          Route map
        </p>
        <p className="font-mono text-[10px] text-ink-faint">
          {track.points.length} points · {track.totalMiles.toFixed(1)} mi
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        aria-label="Route map showing trail track from GPX data"
      >
        {/* Backdrop */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill="var(--color-surface-2)"
          rx="4"
        />
        {/* Grid hint */}
        <g opacity="0.5">
          {[1, 2, 3].map((i) => (
            <line
              key={`gx-${i}`}
              x1={(W / 4) * i}
              x2={(W / 4) * i}
              y1={0}
              y2={H}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          ))}
          {[1, 2].map((i) => (
            <line
              key={`gy-${i}`}
              x1={0}
              x2={W}
              y1={(H / 3) * i}
              y2={(H / 3) * i}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          ))}
        </g>
        {/* Track */}
        <path
          d={d}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Start marker */}
        <circle
          cx={toX(start.lon)}
          cy={toY(start.lat)}
          r="6"
          fill="var(--color-ok-bg)"
          stroke="var(--color-ok-text)"
          strokeWidth="1.5"
        />
        <text
          x={toX(start.lon)}
          y={toY(start.lat) - 10}
          fontSize="10"
          fontFamily="var(--font-mono)"
          fill="var(--color-ok-text)"
          textAnchor="middle"
        >
          START
        </text>
        {/* End marker */}
        <circle
          cx={toX(end.lon)}
          cy={toY(end.lat)}
          r="6"
          fill="var(--color-info-bg)"
          stroke="var(--color-info-text)"
          strokeWidth="1.5"
        />
        <text
          x={toX(end.lon)}
          y={toY(end.lat) - 10}
          fontSize="10"
          fontFamily="var(--font-mono)"
          fill="var(--color-info-text)"
          textAnchor="middle"
        >
          END
        </text>
      </svg>
      <div className="flex items-center justify-between text-[10px] text-ink-faint mt-2 font-mono">
        <span>
          {bounds.minLat.toFixed(4)}, {bounds.minLon.toFixed(4)}
        </span>
        <span>
          {bounds.maxLat.toFixed(4)}, {bounds.maxLon.toFixed(4)}
        </span>
      </div>
      {partial && (
        <p className="text-[10px] text-ink-faint mt-2 leading-snug">
          <strong className="text-warn-text">Partial coverage.</strong>{" "}
          {partialNote}
        </p>
      )}
    </div>
  );
}
