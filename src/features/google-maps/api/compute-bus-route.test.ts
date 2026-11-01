import { beforeEach, expect, it, vi } from "vitest";
import { computeBusRoute } from "./compute-bus-route";

const { searchNearby, computeRoutes } = vi.hoisted(() => ({
  searchNearby: vi.fn(),
  computeRoutes: vi.fn(),
}));
vi.mock("@/shared/lib/google-maps/load-google-maps", () => ({
  loadGooglePlaces: async () => ({
    Place: { searchNearby },
    SearchNearbyRankPreference: { DISTANCE: "DISTANCE" },
  }),
  loadGoogleRoutes: async () => ({ Route: { computeRoutes } }),
}));
class LatLng {
  constructor(
    public latValue: number,
    public lngValue: number,
  ) {}
  toJSON() {
    return { lat: this.latValue, lng: this.lngValue };
  }
  equals(other: LatLng) {
    return this.latValue === other.latValue && this.lngValue === other.lngValue;
  }
}
const origin = new LatLng(0, 0) as unknown as google.maps.LatLng;
const destination = new LatLng(0, 1) as unknown as google.maps.LatLng;
const departure = { lat: 0, lng: 0.001 };
const arrival = { lat: 0, lng: 0.999 };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("google", {
    maps: { LatLng, TravelMode: { TRANSIT: "TRANSIT", WALKING: "WALKING" } },
  });
  searchNearby
    .mockResolvedValueOnce({
      places: [{ id: "a", location: new LatLng(departure.lat, departure.lng) }],
    })
    .mockResolvedValueOnce({
      places: [{ id: "b", location: new LatLng(arrival.lat, arrival.lng) }],
    });
});
it("builds walking, one bus, walking using the nearest stops", async () => {
  computeRoutes
    .mockResolvedValueOnce({
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  travelMode: "TRANSIT",
                  path: [departure, arrival],
                  transitDetails: {
                    departureStop: { location: departure },
                    arrivalStop: { location: arrival },
                  },
                },
              ],
            },
          ],
        },
      ],
    })
    .mockResolvedValue({ routes: [{ path: [departure, arrival] }] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.segments.map((segment) => segment.mode)).toEqual([
    "WALKING",
    "TRANSIT",
    "WALKING",
  ]);
  expect(searchNearby.mock.calls[0][0]).toMatchObject({
    maxResultCount: 1,
    rankPreference: "DISTANCE",
  });
  expect(computeRoutes.mock.calls[1][0].travelMode).toBe("WALKING");
});
it("uses the actual transit stops even when Places coordinates differ", async () => {
  computeRoutes
    .mockResolvedValueOnce({
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  travelMode: "TRANSIT",
                  path: [departure, arrival],
                  transitDetails: {
                    departureStop: { location: arrival },
                    arrivalStop: { location: arrival },
                  },
                },
              ],
            },
          ],
        },
      ],
    })
    .mockResolvedValue({ routes: [{ path: [departure, arrival] }] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.boarding.location.toJSON()).toEqual(arrival);
  expect(trip.segments.map((segment) => segment.mode)).toEqual([
    "WALKING",
    "TRANSIT",
    "WALKING",
  ]);
});
it("rejects transfers", async () => {
  computeRoutes.mockResolvedValue({
    routes: [
      {
        legs: [
          { steps: [{ travelMode: "TRANSIT" }, { travelMode: "TRANSIT" }] },
        ],
      },
    ],
  });
  await expect(computeBusRoute(origin, destination)).rejects.toThrow(
    "linha direta",
  );
});
