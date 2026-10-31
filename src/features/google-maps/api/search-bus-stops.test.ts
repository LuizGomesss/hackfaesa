import { expect, it, vi } from "vitest";
import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import type { BusStopSearch } from "../model/bus-stop";
import { searchBusStops } from "./search-bus-stops";

vi.mock("@/shared/lib/google-maps/load-google-maps", () => ({
  loadGooglePlaces: vi.fn(),
}));

it("requests bus stops and excludes missing coordinates or places outside the viewport", async () => {
  const location = { toJSON: () => ({ lat: -20.3, lng: -40.3 }) };
  const outside = { toJSON: () => ({ lat: -21, lng: -41 }) };
  const searchNearby = vi.fn(async () => ({
    places: [
      { id: "inside", displayName: "Embarque", location },
      { id: "outside", location: outside },
      { id: "missing" },
    ],
  }));
  vi.mocked(loadGooglePlaces).mockResolvedValue({
    Place: { searchNearby },
    SearchNearbyRankPreference: { DISTANCE: "DISTANCE" },
  } as unknown as google.maps.PlacesLibrary);
  const search = {
    key: "area",
    center: { lat: -20.3, lng: -40.3 },
    radius: 500,
    bounds: { contains: (value: unknown) => value === location },
  } as unknown as BusStopSearch;
  expect(await searchBusStops(search)).toEqual({
    limited: false,
    stops: [{ id: "inside", name: "Embarque", lat: -20.3, lng: -40.3 }],
  });
  expect(searchNearby).toHaveBeenCalledWith(
    expect.objectContaining({
      includedTypes: ["bus_stop"],
      maxResultCount: 20,
      locationRestriction: { center: search.center, radius: 500 },
    }),
  );
});
