import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import { loadGoogleRoutes } from "@/shared/lib/google-maps/load-google-maps";
import { tripTiming } from "../model/trip-timing";

export interface TripSegment {
  mode: "WALKING" | "TRANSIT";
  path: google.maps.LatLngLiteral[];
  durationMillis?: number | null;
  distanceMeters?: number | null;
}
interface WalkSummary {
  minutes: number | null;
  meters: number | null;
}
export interface RideSummary {
  line: string;
  boarding: string;
  alighting: string;
  boardingTime?: string;
  alightingTime?: string;
  waitingMinutes: number | null;
  walkBefore: WalkSummary;
  busMinutes: number | null;
  busMeters: number | null;
  headsign: string | null;
  stopCount: number | null;
  frequencyMinutes: number | null;
  agencies: { name: string; url?: string; phone?: string }[];
  lineName: string | null;
  lineUrl?: string;
  tripNumber: string | null;
}
export interface TripSummary extends RideSummary {
  minutes: number | null;
  timing: ReturnType<typeof tripTiming>;
  firstWalk: WalkSummary;
  lastWalk: WalkSummary;
  fare: string | null;
  warnings: string[];
  rides: RideSummary[];
  transfers: number;
  lines: string[];
}
const minutes = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? Math.ceil(value / 60000) : null;
const iso = (date?: Date | null) =>
  date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
function sum(values: (number | null | undefined)[]) {
  return values.every((value) => value != null && Number.isFinite(value))
    ? values.reduce<number>((total, value) => total + (value ?? 0), 0)
    : null;
}
function walkSummary(steps: google.maps.routes.RouteLegStep[]): WalkSummary {
  return {
    minutes: minutes(sum(steps.map((step) => step.staticDurationMillis))),
    meters: sum(steps.map((step) => step.distanceMeters)),
  };
}
function validBus(step: google.maps.routes.RouteLegStep) {
  const departure = step.transitDetails?.departureStop?.location;
  const arrival = step.transitDetails?.arrivalStop?.location;
  const vehicle = step.transitDetails?.transitLine?.vehicle?.vehicleType;
  return (
    !!departure &&
    !!arrival &&
    (!vehicle ||
      vehicle === "BUS" ||
      vehicle === "TROLLEYBUS" ||
      vehicle === "INTERCITY_BUS") &&
    step.path.length > 0 &&
    step.path.every(
      (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
    ) &&
    distanceInMeters(step.path[0], departure) <= 150 &&
    distanceInMeters(step.path[step.path.length - 1], arrival) <= 150
  );
}

export async function computeBusRoute(
  origin: google.maps.LatLng,
  destination: google.maps.LatLng,
) {
  const { Route } = await loadGoogleRoutes();
  const startedAt = Date.now();
  // Query the entire journey so Google can connect lines and terminals using
  // compatible departure times, including access and transfer walks.
  const request: google.maps.routes.ComputeRoutesRequest = {
    origin,
    destination,
    departureTime: new Date(startedAt),
    travelMode: "TRANSIT",
    polylineQuality: "HIGH_QUALITY",
    computeAlternativeRoutes: true,
    transitPreference: {
      allowedTransitModes: ["BUS"],
      routingPreference: "LESS_WALKING",
    },
    fields: ["path", "legs", "durationMillis", "localizedValues", "warnings"],
  };
  const responses = await Promise.allSettled([
    Route.computeRoutes(request),
    Route.computeRoutes({
      ...request,
      transitPreference: { allowedTransitModes: ["BUS"] },
    }),
  ]);
  const successful = responses.filter(
    (result) => result.status === "fulfilled",
  );
  if (!successful.length) {
    const failure = responses.find((result) => result.status === "rejected");
    throw failure?.reason ?? new Error("Não foi possível consultar as rotas.");
  }
  const candidates = successful
    .flatMap((result) => result.value.routes ?? [])
    .map((route) => {
      const steps = (route.legs ?? []).flatMap((leg) => leg.steps);
      const buses = steps.filter((step) => step.travelMode === "TRANSIT");
      return { route, steps, buses };
    })
    .filter(
      ({ steps, buses }) =>
        buses.length > 0 &&
        buses.every(validBus) &&
        steps.every(
          (step) =>
            step.travelMode === "WALKING" || step.travelMode === "TRANSIT",
        ),
    );
  function walkingDistance(steps: google.maps.routes.RouteLegStep[]) {
    const walking = steps.filter((step) => step.travelMode === "WALKING");
    // Prefer measured distances; use walking duration only when metres are absent.
    const distances = walking.map(
      (step) =>
        step.distanceMeters ??
        (step.staticDurationMillis != null
          ? (step.staticDurationMillis / 1000) * 1.3
          : null),
    );
    return sum(distances) ?? Infinity;
  }
  function duration(candidate: (typeof candidates)[number]) {
    const finalBus = candidate.buses[candidate.buses.length - 1];
    const arrival = finalBus.transitDetails?.arrivalTime?.getTime();
    const lastWalk = sum(
      candidate.steps
        .slice(candidate.steps.indexOf(finalBus) + 1)
        .map((step) => step.staticDurationMillis),
    );
    const scheduled =
      arrival != null && lastWalk != null ? arrival + lastWalk - startedAt : 0;
    return Math.max(candidate.route.durationMillis ?? 0, scheduled) || Infinity;
  }
  const fastest = Math.min(...candidates.map(duration));
  // A shorter walk can justify a modest detour, never hours of extra travel.
  const maximumExtraTime = Math.min(
    30 * 60000,
    Math.max(15 * 60000, fastest * 0.25),
  );
  const eligible = candidates.filter(
    (candidate) => duration(candidate) <= fastest + maximumExtraTime,
  );
  function score(candidate: (typeof candidates)[number]) {
    return (
      duration(candidate) +
      (walkingDistance(candidate.steps) / 1.3) * 1000 * 2 +
      (candidate.buses.length - 1) * 3 * 60000
    );
  }
  eligible.sort((a, b) => score(a) - score(b) || duration(a) - duration(b));
  const selected = eligible[0];
  if (!selected)
    throw new Error(
      "Não foi possível obter uma rota de ônibus válida para este trajeto e horário, incluindo opções com baldeação.",
    );
  const { route, steps, buses } = selected;
  const firstIndex = steps.indexOf(buses[0]),
    lastIndex = steps.indexOf(buses[buses.length - 1]);
  const firstWalkSteps = steps.slice(0, firstIndex),
    lastWalkSteps = steps.slice(lastIndex + 1);
  const firstWalk = walkSummary(firstWalkSteps),
    lastWalk = walkSummary(lastWalkSteps);
  const rides: RideSummary[] = [];
  const stops: { location: google.maps.LatLng; label: string }[] = [];
  let previousIndex = -1;
  let previousArrival: number | null = startedAt;
  let missedConnection = false;
  for (const [index, step] of buses.entries()) {
    const details = step.transitDetails;
    const stepIndex = steps.indexOf(step);
    const walkSteps = steps.slice(previousIndex + 1, stepIndex);
    const walkingMillis = sum(
      walkSteps.map((walk) => walk.staticDurationMillis),
    );
    const departureTime = iso(details?.departureTime);
    const arrivalTime =
      iso(details?.arrivalTime) ??
      (departureTime && step.staticDurationMillis != null
        ? new Date(
            Date.parse(departureTime) + step.staticDurationMillis,
          ).toISOString()
        : undefined);
    const readyAt =
      previousArrival != null && walkingMillis != null
        ? previousArrival + walkingMillis
        : null;
    const waiting =
      readyAt != null && departureTime
        ? Date.parse(departureTime) - readyAt
        : null;
    if (waiting != null && waiting < -60000) missedConnection = true;
    const line = details?.transitLine;
    const ride: RideSummary = {
      line: line?.shortName || line?.name || "Ônibus",
      boarding: details?.departureStop?.name || "Ponto de embarque",
      alighting: details?.arrivalStop?.name || "Ponto de desembarque",
      boardingTime: departureTime,
      alightingTime: arrivalTime,
      waitingMinutes: waiting != null && waiting >= 0 ? minutes(waiting) : null,
      walkBefore: walkSummary(walkSteps),
      busMinutes:
        departureTime && arrivalTime
          ? minutes(Date.parse(arrivalTime) - Date.parse(departureTime))
          : minutes(step.staticDurationMillis),
      busMeters: step.distanceMeters ?? null,
      headsign: details?.headsign ?? null,
      stopCount: details?.stopCount ?? null,
      frequencyMinutes: minutes(details?.headwayMillis),
      agencies: (line?.agencies ?? []).map((agency) => ({
        name: agency.name || "Operadora",
        url: agency.url?.toString(),
        phone: agency.phoneNumber ?? undefined,
      })),
      lineName: line?.name ?? null,
      lineUrl: line?.url?.toString(),
      tripNumber: details?.tripShortText ?? null,
    };
    rides.push(ride);
    const departure = details?.departureStop?.location,
      arrival = details?.arrivalStop?.location;
    if (departure && arrival) {
      stops.push({
        location: new google.maps.LatLng(departure.lat, departure.lng),
        label:
          index === 0 ? `Embarque · ${ride.line}` : `Baldeação · ${ride.line}`,
      });
      stops.push({
        location: new google.maps.LatLng(arrival.lat, arrival.lng),
        label:
          index === buses.length - 1
            ? "Desembarque"
            : `Desembarque · ${ride.line}`,
      });
    }
    previousIndex = stepIndex;
    previousArrival = arrivalTime ? Date.parse(arrivalTime) : null;
  }
  const finalAlightingTime = rides[rides.length - 1].alightingTime;
  const timing = tripTiming(
    startedAt,
    sum(firstWalkSteps.map((step) => step.staticDurationMillis)),
    sum(lastWalkSteps.map((step) => step.staticDurationMillis)),
    null,
    rides[0].boardingTime ? new Date(rides[0].boardingTime) : null,
    finalAlightingTime ? new Date(finalAlightingTime) : null,
  );
  timing.missedConnection = missedConnection;
  if (missedConnection) {
    timing.minutes = null;
    timing.arrivalTime = undefined;
  }
  const totalMinutes = missedConnection
    ? null
    : (timing.minutes ?? minutes(route.durationMillis));
  if (
    !timing.arrivalTime &&
    !missedConnection &&
    route.durationMillis != null &&
    Number.isFinite(route.durationMillis)
  ) {
    timing.arrivalTime = new Date(
      startedAt + route.durationMillis,
    ).toISOString();
  }
  const summary: TripSummary = {
    ...rides[0],
    minutes: totalMinutes,
    timing,
    firstWalk,
    lastWalk,
    rides,
    transfers: rides.length - 1,
    lines: [...new Set(rides.map((ride) => ride.line))],
    alighting: rides[rides.length - 1].alighting,
    fare: route.localizedValues?.transitFare ?? null,
    warnings: route.warnings ?? [],
  };
  const segments: TripSegment[] = steps
    .filter((step) => step.path.length > 0)
    .map((step) => ({
      mode: step.travelMode === "TRANSIT" ? "TRANSIT" : "WALKING",
      path: step.path.map((point) => ({ lat: point.lat, lng: point.lng })),
      durationMillis: step.staticDurationMillis,
      distanceMeters: step.distanceMeters,
    }));
  return {
    summary,
    segments,
    stops,
    boarding: { name: rides[0].boarding, location: stops[0].location },
    alighting: {
      name: summary.alighting,
      location: stops[stops.length - 1].location,
    },
  };
}
