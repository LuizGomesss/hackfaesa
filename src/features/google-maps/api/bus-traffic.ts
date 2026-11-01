import { loadGoogleRoutes } from "@/shared/lib/google-maps/load-google-maps";

type Point = google.maps.LatLngLiteral;
export const TRAFFIC_COLORS = {
  NORMAL: "#16a34a",
  SLOW: "#eab308",
  TRAFFIC_JAM: "#dc2626",
  UNKNOWN: "#64748b",
};
export interface TrafficSection {
  path: Point[];
  color: string;
}

// Compare road segments in metres, including direction to avoid the opposite lane.
export function colorBusPath(
  path: Point[],
  readings: { path: Point[]; speed?: string | null }[],
): TrafficSection[] {
  const sections: TrafficSection[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i];
    const latitude = (a.lat + b.lat) / 2;
    const x = 111320 * Math.cos((latitude * Math.PI) / 180),
      y = 111320;
    const bx = (b.lng - a.lng) * x,
      by = (b.lat - a.lat) * y;
    let nearest = 40,
      speed = "UNKNOWN";
    for (const reading of readings) {
      for (let j = 1; j < reading.path.length; j++) {
        const c = reading.path[j - 1],
          d = reading.path[j];
        const dx = (d.lng - c.lng) * x,
          dy = (d.lat - c.lat) * y;
        const length = dx * dx + dy * dy;
        if (
          !length ||
          (bx * dx + by * dy) / (Math.hypot(bx, by) * Math.sqrt(length)) < 0.7
        )
          continue;
        const px = ((a.lng + b.lng) / 2 - c.lng) * x,
          py = ((a.lat + b.lat) / 2 - c.lat) * y;
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / length));
        const distance = Math.hypot(px - t * dx, py - t * dy);
        if (distance < nearest) {
          nearest = distance;
          speed = reading.speed || "UNKNOWN";
        }
      }
    }
    const color =
      TRAFFIC_COLORS[speed as keyof typeof TRAFFIC_COLORS] ||
      TRAFFIC_COLORS.UNKNOWN;
    const previous = sections[sections.length - 1];
    if (previous?.color === color) previous.path.push(b);
    else sections.push({ path: [a, b], color });
  }
  return sections;
}

export async function getBusTraffic(path: Point[]): Promise<TrafficSection[]> {
  if (path.length < 2) return [];
  try {
    const { Route } = await loadGoogleRoutes();
    const intermediates = [];
    for (let i = 1; i < 12; i++) {
      const index = Math.floor(((path.length - 1) * i) / 12);
      if (index > 0 && index < path.length - 1)
        intermediates.push({ location: path[index], via: true });
    }
    const response = await Route.computeRoutes({
      origin: path[0],
      destination: path[path.length - 1],
      intermediates,
      travelMode: "DRIVING",
      routingPreference: "TRAFFIC_AWARE",
      polylineQuality: "HIGH_QUALITY",
      extraComputations: ["TRAFFIC_ON_POLYLINE"],
      fields: ["speedPaths"],
    });
    return colorBusPath(path, response.routes?.[0]?.speedPaths ?? []);
  } catch {
    return colorBusPath(path, []);
  }
}
