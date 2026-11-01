import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { computeBusRoute } from "./compute-bus-route";

const { computeRoutes } = vi.hoisted(() => ({ computeRoutes: vi.fn() }));
vi.mock("@/shared/lib/google-maps/load-google-maps", () => ({
  loadGoogleRoutes: async () => ({ Route: { computeRoutes } }),
}));
const start = Date.parse("2026-10-31T12:00:00-03:00");
const point = (lng: number) => ({ lat: -20, lng });
const origin = point(-40.01) as unknown as google.maps.LatLng;
const destination = point(-40.04) as unknown as google.maps.LatLng;
const walk = (from: number, to: number, minutes: number) => ({
  travelMode: "WALKING",
  path: [point(from), point(to)],
  staticDurationMillis: minutes * 60000,
  distanceMeters: minutes * 70,
});
const bus = (
  line: string,
  from: number,
  to: number,
  depart: number,
  arrive: number,
) => ({
  travelMode: "TRANSIT",
  path: [point(from), point(to)],
  staticDurationMillis: (arrive - depart) * 60000,
  distanceMeters: 5000,
  transitDetails: {
    departureTime: new Date(start + depart * 60000),
    arrivalTime: new Date(start + arrive * 60000),
    departureStop: {
      name: from === -40.025 ? "Terminal Central" : "Embarque",
      location: point(from),
    },
    arrivalStop: {
      name: to === -40.024 ? "Terminal Central" : "Desembarque",
      location: point(to),
    },
    transitLine: { shortName: line, vehicle: { vehicleType: "BUS" } },
  },
});
const direct = () => ({
  durationMillis: 35 * 60000,
  legs: [
    {
      steps: [
        walk(-40.01, -40.015, 5),
        bus("519", -40.015, -40.035, 10, 30),
        walk(-40.035, -40.04, 5),
      ],
    },
  ],
});
const transfer = () => ({
  durationMillis: 65 * 60000,
  localizedValues: { transitFare: "R$ 4,90" },
  legs: [
    {
      steps: [
        walk(-40.01, -40.015, 5),
        bus("519", -40.015, -40.024, 10, 30),
        walk(-40.024, -40.025, 3),
        bus("567", -40.025, -40.035, 40, 60),
        walk(-40.035, -40.04, 5),
      ],
    },
  ],
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(start);
  vi.stubGlobal("google", {
    maps: {
      LatLng: class {
        constructor(
          public lat: number,
          public lng: number,
        ) {}
        toJSON() {
          return { lat: this.lat, lng: this.lng };
        }
      },
    },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("preserves direct journeys and derives their timing", async () => {
  computeRoutes.mockResolvedValue({ routes: [direct()] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.minutes).toBe(35);
  expect(trip.summary.transfers).toBe(0);
  expect(trip.summary.lines).toEqual(["519"]);
  expect(trip.segments.map((segment) => segment.mode)).toEqual([
    "WALKING",
    "TRANSIT",
    "WALKING",
  ]);
  expect(computeRoutes.mock.calls[0][0]).toMatchObject({
    origin,
    destination,
    travelMode: "TRANSIT",
  });
});
it("keeps both buses, terminal connection walks, waiting times and fare", async () => {
  computeRoutes.mockResolvedValue({ routes: [transfer()] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.transfers).toBe(1);
  expect(trip.summary.lines).toEqual(["519", "567"]);
  expect(trip.summary.minutes).toBe(65);
  expect(trip.summary.rides.map((ride) => ride.waitingMinutes)).toEqual([5, 7]);
  expect(trip.summary.rides[1].walkBefore.minutes).toBe(3);
  expect(trip.summary.rides[1].boarding).toBe("Terminal Central");
  expect(trip.summary.timing.arrivalTime).toBe(
    new Date(start + 65 * 60000).toISOString(),
  );
  expect(trip.summary.fare).toBe("R$ 4,90");
  expect(trip.stops).toHaveLength(4);
  expect(trip.segments.map((segment) => segment.mode)).toEqual([
    "WALKING",
    "TRANSIT",
    "WALKING",
    "TRANSIT",
    "WALKING",
  ]);
});
it("accepts a transfer inside the same terminal without a walking step", async () => {
  const route = transfer();
  route.legs[0].steps.splice(2, 1);
  computeRoutes.mockResolvedValue({ routes: [route] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.rides[1].walkBefore.minutes).toBe(0);
  expect(trip.summary.rides[1].waitingMinutes).toBe(10);
});
it("prefers the direct route when it also requires less walking", async () => {
  computeRoutes.mockResolvedValue({ routes: [transfer(), direct()] });
  expect((await computeBusRoute(origin, destination)).summary.transfers).toBe(
    0,
  );
});
it("chooses a terminal transfer instead of a long final walk", async () => {
  const longWalk = direct();
  longWalk.legs[0].steps[2] = walk(-40.035, -40.04, 30);
  computeRoutes.mockResolvedValue({ routes: [longWalk, transfer()] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.transfers).toBe(1);
  expect(trip.summary.lastWalk.minutes).toBe(5);
  expect(trip.summary.lines).toEqual(["519", "567"]);
  expect(
    computeRoutes.mock.calls[0][0].transitPreference.routingPreference,
  ).toBe("LESS_WALKING");
});
it("rejects a route with corrupted bus geometry", async () => {
  const route = transfer();
  route.legs[0].steps[3].path[0] = point(10);
  computeRoutes.mockResolvedValue({ routes: [route] });
  await expect(computeBusRoute(origin, destination)).rejects.toThrow(
    "rota de ônibus válida",
  );
});
it("reports a missing route without claiming it must be direct", async () => {
  computeRoutes.mockResolvedValue({ routes: [] });
  await expect(computeBusRoute(origin, destination)).rejects.toThrow(
    "incluindo opções com baldeação",
  );
});

it("supports three buses and two terminal transfers", async () => {
  const route = transfer();
  route.legs[0].steps.splice(4, 0, bus("212", -40.035, -40.035, 65, 75));
  route.durationMillis = 80 * 60000;
  computeRoutes.mockResolvedValue({ routes: [route] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.transfers).toBe(2);
  expect(trip.summary.lines).toEqual(["519", "567", "212"]);
  expect(trip.stops).toHaveLength(6);
  expect(trip.summary.minutes).toBe(80);
});

it("rejects a five-hour detour even if it has much less walking", async () => {
  const detour = transfer();
  detour.durationMillis = 300 * 60000;
  detour.legs[0].steps[0] = walk(-40.01, -40.015, 1);
  detour.legs[0].steps[2] = walk(-40.024, -40.025, 0);
  detour.legs[0].steps[4] = walk(-40.035, -40.04, 1);
  computeRoutes
    .mockResolvedValueOnce({ routes: [detour] })
    .mockResolvedValueOnce({ routes: [direct()] });
  const trip = await computeBusRoute(origin, destination);
  expect(trip.summary.minutes).toBe(35);
  expect(trip.summary.transfers).toBe(0);
  expect(computeRoutes).toHaveBeenCalledTimes(2);
  expect(
    computeRoutes.mock.calls[1][0].transitPreference.routingPreference,
  ).toBeUndefined();
});
it("still returns a route when one routing preference fails", async () => {
  computeRoutes
    .mockRejectedValueOnce(new Error("Unavailable"))
    .mockResolvedValueOnce({ routes: [direct()] });
  expect((await computeBusRoute(origin, destination)).summary.minutes).toBe(35);
});
