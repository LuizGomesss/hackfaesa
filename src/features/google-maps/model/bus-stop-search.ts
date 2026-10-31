import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import type { BusStopSearch } from "./bus-stop";

export function getBusStopSearch(map: google.maps.Map): BusStopSearch | null {
  const bounds = map.getBounds();
  const zoom = map.getZoom() ?? 0;
  if (!bounds) return null;
  const { south, west, north, east } = bounds.toJSON();
  if (zoom < 13 || north - south > 0.15 || east - west > 0.15 || west >= east)
    return null;
  const center = bounds.getCenter().toJSON();
  return {
    key: [zoom, south, west, north, east]
      .map((value) => value.toFixed(5))
      .join(","),
    bounds,
    center,
    radius: Math.min(
      50000,
      distanceInMeters(center, { lat: north, lng: east }),
    ),
  };
}
