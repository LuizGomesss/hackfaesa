import { expect, it } from "vitest";
import { tripTiming } from "./trip-timing";

const start = Date.parse("2026-10-31T23:50:00-03:00");
it("includes walking, waiting and the scheduled bus arrival across midnight", () => {
  const result = tripTiming(
    start,
    600000,
    300000,
    1200000,
    new Date(start + 900000),
    new Date(start + 2100000),
  );
  expect(result.waitingMinutes).toBe(5);
  expect(result.minutes).toBe(40);
  expect(result.arrivalTime).toBe(new Date(start + 2400000).toISOString());
});
it("does not invent an arrival or total time when the departure is unavailable", () => {
  const result = tripTiming(start, 600000, 300000, 1200000);
  expect(result.boardingTime).toBeUndefined();
  expect(result.arrivalTime).toBeUndefined();
  expect(result.minutes).toBeNull();
});
it("flags buses that leave before the walking segment finishes", () => {
  const result = tripTiming(
    start,
    600000,
    300000,
    1200000,
    new Date(start + 300000),
    new Date(start + 1500000),
  );
  expect(result.missedConnection).toBe(true);
  expect(result.minutes).toBeNull();
  expect(result.arrivalTime).toBeUndefined();
});
it("derives the alighting time from departure and bus duration when necessary", () => {
  const result = tripTiming(start, 0, 0, 1200000, new Date(start));
  expect(result.minutes).toBe(20);
  expect(result.alightingTime).toBe(new Date(start + 1200000).toISOString());
});
