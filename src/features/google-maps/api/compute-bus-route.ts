import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import {
  loadGooglePlaces,
  loadGoogleRoutes,
} from "@/shared/lib/google-maps/load-google-maps";
import { tripTiming } from "../model/trip-timing";

export interface TripSegment {
  mode: "WALKING" | "TRANSIT";
  path: google.maps.LatLngLiteral[];
  durationMillis?: number | null;
  distanceMeters?: number | null;
  warnings?: string[];
}

export interface TripSummary {
  minutes: number | null;
  line: string;
  boarding: string;
  alighting: string;
  timing: ReturnType<typeof tripTiming>;
  firstWalk: { minutes: number | null; meters: number | null };
  lastWalk: { minutes: number | null; meters: number | null };
  busMinutes: number | null;
  busMeters: number | null;
  headsign: string | null;
  stopCount: number | null;
  frequencyMinutes: number | null;
  agencies: { name: string; url?: string; phone?: string }[];
  lineName: string | null;
  lineUrl?: string;
  tripNumber: string | null;
  fare: string | null;
  warnings: string[];
}

async function nearestStop(location: google.maps.LatLng) {
  const { Place, SearchNearbyRankPreference } = await loadGooglePlaces();
  const { places } = await Place.searchNearby({
    fields: ["id", "displayName", "location"],
    locationRestriction: { center: location, radius: 50000 },
    includedTypes: ["bus_stop"],
    maxResultCount: 1,
    rankPreference: SearchNearbyRankPreference.DISTANCE,
  });
  const stop = places[0];
  if (!stop?.location)
    throw new Error("Nenhum ponto de ônibus encontrado próximo ao endereço.");
  return {
    id: stop.id,
    name: stop.displayName || "Ponto de ônibus",
    location: stop.location,
  };
}

export async function computeBusRoute(
  origin: google.maps.LatLng,
  destination: google.maps.LatLng,
) {
  const { Route } = await loadGoogleRoutes();
  const startedAt = Date.now();
  let selectedFare: string | null = null;
  let selectedWarnings: string[] = [];
  const [boarding, alighting] = await Promise.all([
    nearestStop(origin),
    nearestStop(destination),
  ]);
  if (boarding.id === alighting.id)
    throw new Error(
      "Origem e destino têm o mesmo ponto mais próximo. Não há trecho de ônibus entre eles.",
    );
  async function findBus(from: google.maps.LatLng, to: google.maps.LatLng) {
    const response = await Route.computeRoutes({
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.TRANSIT,
      polylineQuality: "HIGH_QUALITY",
      computeAlternativeRoutes: true,
      transitPreference: {
        allowedTransitModes: ["BUS"],
        routingPreference: "FEWER_TRANSFERS",
      },
      fields: ["path", "legs", "localizedValues", "warnings"],
    });
    return response.routes
      ?.flatMap((route) => {
        const transit = (route.legs ?? [])
          .flatMap((leg) => leg.steps)
          .filter((step) => step.travelMode === "TRANSIT");
        if (transit.length !== 1) return [];
        const step = transit[0];
        const departure = step.transitDetails?.departureStop?.location;
        const arrival = step.transitDetails?.arrivalStop?.location;
        if (!departure || !arrival || !step.path.length) return [];
        const first = step.path[0];
        const last = step.path[step.path.length - 1];
        if (
          step.path.some(
            (point) =>
              !Number.isFinite(point.lat) || !Number.isFinite(point.lng),
          ) ||
          distanceInMeters(first, departure) > 150 ||
          distanceInMeters(last, arrival) > 150
        )
          return [];
        return [
          {
            step,
            fare: route.localizedValues?.transitFare ?? null,
            warnings: route.warnings ?? [],
          },
        ];
      })
      .sort((a, b) => {
        function walkingDistance(step: google.maps.routes.RouteLegStep) {
          const start = step.transitDetails?.departureStop?.location;
          const end = step.transitDetails?.arrivalStop?.location;
          return start && end
            ? distanceInMeters(origin.toJSON(), start) +
                distanceInMeters(destination.toJSON(), end)
            : Infinity;
        }
        return walkingDistance(a.step) - walkingDistance(b.step);
      })
      .slice(0, 1)
      .map((candidate) => {
        selectedFare = candidate.fare;
        selectedWarnings = candidate.warnings;
        return candidate.step;
      })[0];
  }
  // A nearby Places stop may be on the opposite side of the road or absent
  // from the transit network. Let Routes find a usable stop when necessary.
  const busStep =
    (await findBus(boarding.location, alighting.location)) ??
    (await findBus(origin, destination));
  if (!busStep)
    throw new Error(
      "O Google Maps não retornou uma linha direta de ônibus para este trajeto. Tente ajustar a origem ou o destino.",
    );

  async function walk(
    from: google.maps.LatLng,
    to: google.maps.LatLng,
  ): Promise<TripSegment> {
    if (from.equals(to))
      return {
        mode: "WALKING",
        path: [from.toJSON()],
        durationMillis: 0,
        distanceMeters: 0,
      };
    const result = await Route.computeRoutes({
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.WALKING,
      polylineQuality: "HIGH_QUALITY",
      fields: ["path", "durationMillis", "distanceMeters", "warnings"],
    });
    const path = result.routes?.[0]?.path;
    if (!path?.length)
      throw new Error(
        "Não foi possível calcular o trecho a pé até o ponto de ônibus.",
      );
    return {
      mode: "WALKING",
      durationMillis: result.routes?.[0]?.durationMillis,
      distanceMeters: result.routes?.[0]?.distanceMeters,
      warnings: result.routes?.[0]?.warnings,
      path: path.map((point) => ({ lat: point.lat, lng: point.lng })),
    };
  }
  const departure = busStep.transitDetails?.departureStop?.location;
  const arrival = busStep.transitDetails?.arrivalStop?.location;
  if (!departure || !arrival)
    throw new Error("Os pontos da linha não foram informados.");
  const boardingLocation = new google.maps.LatLng(departure.lat, departure.lng);
  const alightingLocation = new google.maps.LatLng(arrival.lat, arrival.lng);
  const [first, last] = await Promise.all([
    walk(origin, boardingLocation),
    walk(alightingLocation, destination),
  ]);
  const details = busStep.transitDetails;
  const timing = tripTiming(
    startedAt,
    first.durationMillis,
    last.durationMillis,
    busStep.staticDurationMillis,
    details?.departureTime,
    details?.arrivalTime,
  );
  const walkSummary = (segment: TripSegment) => ({
    minutes:
      segment.durationMillis != null
        ? Math.ceil(segment.durationMillis / 60000)
        : null,
    meters: segment.distanceMeters ?? null,
  });
  return {
    summary: {
      minutes: timing.minutes,
      timing,
      firstWalk: walkSummary(first),
      lastWalk: walkSummary(last),
      busMinutes:
        busStep.staticDurationMillis != null
          ? Math.ceil(busStep.staticDurationMillis / 60000)
          : null,
      busMeters: busStep.distanceMeters ?? null,
      headsign: details?.headsign ?? null,
      stopCount: details?.stopCount ?? null,
      frequencyMinutes:
        details?.headwayMillis != null && Number.isFinite(details.headwayMillis)
          ? Math.ceil(details.headwayMillis / 60000)
          : null,
      agencies: (details?.transitLine?.agencies ?? []).map((agency) => ({
        name: agency.name || "Operadora",
        url: agency.url?.toString(),
        phone: agency.phoneNumber ?? undefined,
      })),
      lineName: details?.transitLine?.name ?? null,
      lineUrl: details?.transitLine?.url?.toString(),
      tripNumber: details?.tripShortText ?? null,
      fare: selectedFare,
      warnings: [
        ...new Set([
          ...selectedWarnings,
          ...(first.warnings ?? []),
          ...(last.warnings ?? []),
        ]),
      ],
      line:
        busStep.transitDetails?.transitLine?.shortName ||
        busStep.transitDetails?.transitLine?.name ||
        "Ônibus",
      boarding: busStep.transitDetails?.departureStop?.name || boarding.name,
      alighting: busStep.transitDetails?.arrivalStop?.name || alighting.name,
    } satisfies TripSummary,
    boarding: {
      name: busStep.transitDetails?.departureStop?.name || boarding.name,
      location: boardingLocation,
    },
    alighting: {
      name: busStep.transitDetails?.arrivalStop?.name || alighting.name,
      location: alightingLocation,
    },
    segments: [
      first,
      {
        mode: "TRANSIT",
        path: busStep.path.map((point) => ({ lat: point.lat, lng: point.lng })),
      },
      last,
    ] satisfies TripSegment[],
  };
}
