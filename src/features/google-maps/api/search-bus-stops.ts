import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import type { BusStopSearch, BusStopSearchResult } from "../model/bus-stop";

export async function searchBusStops(
  search: BusStopSearch,
): Promise<BusStopSearchResult> {
  const { Place, SearchNearbyRankPreference } = await loadGooglePlaces();
  const { places } = await Place.searchNearby({
    fields: ["id", "displayName", "location"],
    locationRestriction: { center: search.center, radius: search.radius },
    includedTypes: ["bus_stop"],
    maxResultCount: 20,
    rankPreference: SearchNearbyRankPreference.DISTANCE,
  });
  return {
    limited: places.length === 20,
    stops: places.flatMap((place) =>
      place.location && search.bounds.contains(place.location)
        ? [
            {
              id: place.id,
              ...place.location.toJSON(),
              name: place.displayName || "Ponto de ônibus",
            },
          ]
        : [],
    ),
  };
}
