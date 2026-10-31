import { expect, it } from "vitest";
import { distanceInMeters } from "./distance-in-meters";

it("calculates geographic distances in meters", () => {
  expect(distanceInMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
  expect(distanceInMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(
    111194.93,
    1,
  );
});
