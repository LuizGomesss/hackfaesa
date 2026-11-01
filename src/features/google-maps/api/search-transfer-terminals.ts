import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import type { TransferTerminal } from "../model/transfer-terminal";
import { terminalIdentity } from "../model/transfer-terminal";

export async function searchTransferTerminals(
  centers: google.maps.LatLngLiteral[],
): Promise<TransferTerminal[]> {
  if (!centers.length) return [];
  const { Place } = await loadGooglePlaces();
  const responses = await Promise.allSettled(
    centers.slice(0, 2).map((center) =>
      Place.searchByText({
        textQuery: "terminal de ônibus urbano",
        fields: ["id", "displayName", "location"],
        includedType: "bus_station",
        locationBias: { center, radius: 1500 },
        maxResultCount: 5,
        language: "pt-BR",
        region: "br",
      }),
    ),
  );
  const terminals = new Map<string, TransferTerminal>();
  for (const response of responses) {
    if (response.status !== "fulfilled") continue;
    for (const place of response.value.places) {
      const location = place.location?.toJSON();
      const identity = terminalIdentity(place.displayName ?? "");
      if (
        !location ||
        !identity ||
        !centers.some((center) => distanceInMeters(center, location) <= 1500)
      )
        continue;
      terminals.set(place.id, {
        name: place.displayName ?? "",
        location,
        waypoint: place,
      });
    }
  }
  return [...terminals.values()];
}
