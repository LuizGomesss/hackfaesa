import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import {
  loadGooglePlaces,
  loadGoogleRoutes,
} from "@/shared/lib/google-maps/load-google-maps";

export interface TripSegment {
  mode: "WALKING" | "TRANSIT";
  path: google.maps.LatLngLiteral[];
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
      fields: ["path", "legs"],
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
        return [step];
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
        return walkingDistance(a) - walkingDistance(b);
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
    if (from.equals(to)) return { mode: "WALKING", path: [from.toJSON()] };
    const result = await Route.computeRoutes({
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.WALKING,
      polylineQuality: "HIGH_QUALITY",
      fields: ["path"],
    });
    const path = result.routes?.[0]?.path;
    if (!path?.length)
      throw new Error(
        "Não foi possível calcular o trecho a pé até o ponto de ônibus.",
      );
    return {
      mode: "WALKING",
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
  return {
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
