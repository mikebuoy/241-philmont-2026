export type GpxPoint = {
  lat: number;
  lon: number;
  /** Elevation in meters from GPX, converted to ft for display. */
  eleFt: number;
};

export type GpxTrack = {
  name: string | null;
  points: GpxPoint[];
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    minEleFt: number;
    maxEleFt: number;
  };
  /** Cumulative distance in miles at each point. */
  cumMiles: number[];
  totalMiles: number;
};

const M_TO_FT = 3.28084;
const EARTH_RADIUS_MI = 3958.8;

/** Haversine distance in miles between two lat/lon pairs. */
function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

/**
 * Fetch and parse a GPX file from Supabase Storage by path.
 * `path` is the object path inside the `gpx` bucket (e.g. "2026-06-18.gpx").
 */
export async function loadGpxFromStorage(
  path: string | null,
): Promise<GpxTrack | null> {
  if (!path) return null;
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gpx/${path}`;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const xml = await res.text();
    return parseGpx(xml);
  } catch {
    return null;
  }
}

function parseGpx(xml: string): GpxTrack {
  const nameMatch = xml.match(/<trk>\s*<name>([^<]+)<\/name>/);
  const name = nameMatch ? nameMatch[1] : null;

  const trkptRegex =
    /<trkpt\s+lat="([\d.\-]+)"\s+lon="([\d.\-]+)"[^>]*>\s*(?:<ele>([\d.\-]+)<\/ele>)?/g;
  const points: GpxPoint[] = [];
  let m: RegExpExecArray | null;
  while ((m = trkptRegex.exec(xml)) !== null) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const eleM = m[3] ? parseFloat(m[3]) : 0;
    points.push({ lat, lon, eleFt: eleM * M_TO_FT });
  }

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const eles = points.map((p) => p.eleFt);

  const cumMiles: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const d = haversineMiles(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon,
    );
    cumMiles.push(cumMiles[i - 1] + d);
  }

  return {
    name,
    points,
    bounds: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minEleFt: Math.min(...eles),
      maxEleFt: Math.max(...eles),
    },
    cumMiles,
    totalMiles: cumMiles[cumMiles.length - 1] ?? 0,
  };
}
