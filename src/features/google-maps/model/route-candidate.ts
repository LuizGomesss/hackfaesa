import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";

export interface TransitRouteData {
  legs?: google.maps.routes.RouteLeg[] | null;
  durationMillis?: number | null;
  distanceMeters?: number | null;
  localizedValues?: { transitFare?: string | null } | null;
  warnings?: string[] | null;
}

export interface RouteCandidate {
  route: TransitRouteData;
  steps: google.maps.routes.RouteLegStep[];
  buses: google.maps.routes.RouteLegStep[];
}

export function sum(values: (number | null | undefined)[]) {
  return values.every((value) => value != null && Number.isFinite(value))
    ? values.reduce<number>((total, value) => total + (value ?? 0), 0)
    : null;
}

export function walkingDistance(steps: google.maps.routes.RouteLegStep[]) {
  return (
    sum(
      steps.map(
        (step) =>
          step.distanceMeters ??
          (step.staticDurationMillis != null
            ? (step.staticDurationMillis / 1000) * 1.3
            : null),
      ),
    ) ?? Infinity
  );
}

export function candidateFromRoute(
  route: TransitRouteData,
): RouteCandidate | null {
  const steps = (route.legs ?? []).flatMap((leg) => leg.steps);
  const buses = steps.filter((step) => step.travelMode === "TRANSIT");
  if (
    !buses.length ||
    steps.some(
      (step) => step.travelMode !== "WALKING" && step.travelMode !== "TRANSIT",
    )
  )
    return null;
  for (const step of buses) {
    const departure = step.transitDetails?.departureStop?.location;
    const arrival = step.transitDetails?.arrivalStop?.location;
    const vehicle = step.transitDetails?.transitLine?.vehicle?.vehicleType;
    if (
      !departure ||
      !arrival ||
      (vehicle &&
        vehicle !== "BUS" &&
        vehicle !== "TROLLEYBUS" &&
        vehicle !== "INTERCITY_BUS") ||
      !step.path.length ||
      step.path.some(
        (point) => !Number.isFinite(point.lat) || !Number.isFinite(point.lng),
      ) ||
      distanceInMeters(step.path[0], departure) > 150 ||
      distanceInMeters(step.path[step.path.length - 1], arrival) > 150
    )
      return null;
  }
  return { route, steps, buses };
}

export function finalArrival(candidate: RouteCandidate) {
  const last = candidate.buses[candidate.buses.length - 1];
  const arrival = last.transitDetails?.arrivalTime?.getTime();
  const walk = sum(
    candidate.steps
      .slice(candidate.steps.indexOf(last) + 1)
      .map((step) => step.staticDurationMillis),
  );
  return arrival != null && Number.isFinite(arrival) && walk != null
    ? arrival + walk
    : null;
}

export function routeDuration(candidate: RouteCandidate, startedAt: number) {
  const arrival = finalArrival(candidate);
  return (
    Math.max(
      candidate.route.durationMillis ?? 0,
      arrival != null ? arrival - startedAt : 0,
    ) || Infinity
  );
}

// A stitched journey must be reachable from the original departure time,
// including every access walk and transfer. Never join incompatible timetables.
export function isReachable(candidate: RouteCandidate, startedAt: number) {
  let readyAt = startedAt;
  let previousIndex = -1;
  for (const bus of candidate.buses) {
    const index = candidate.steps.indexOf(bus);
    const walk = sum(
      candidate.steps
        .slice(previousIndex + 1, index)
        .map((step) => step.staticDurationMillis),
    );
    const departure = bus.transitDetails?.departureTime?.getTime();
    const arrival = bus.transitDetails?.arrivalTime?.getTime();
    if (
      walk == null ||
      departure == null ||
      arrival == null ||
      !Number.isFinite(departure) ||
      !Number.isFinite(arrival) ||
      departure < readyAt + walk ||
      arrival < departure
    )
      return false;
    readyAt = arrival;
    previousIndex = index;
  }
  return true;
}
