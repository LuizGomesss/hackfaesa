import { expect, it } from "vitest";
import { colorBusPath, TRAFFIC_COLORS } from "./bus-traffic";

const path = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 0.001 },
  { lat: 0, lng: 0.002 },
  { lat: 0, lng: 0.003 },
];
it("colors the bus geometry by actual road traffic readings", () => {
  const sections = colorBusPath(path, [
    { path: path.slice(0, 2), speed: "NORMAL" },
    { path: path.slice(1, 3), speed: "SLOW" },
    { path: path.slice(2, 4), speed: "TRAFFIC_JAM" },
  ]);
  expect(sections.map((section) => section.color)).toEqual([
    TRAFFIC_COLORS.NORMAL,
    TRAFFIC_COLORS.SLOW,
    TRAFFIC_COLORS.TRAFFIC_JAM,
  ]);
  expect(
    sections
      .flatMap((section) => section.path)
      .every((point) => path.includes(point)),
  ).toBe(true);
});
it("does not label missing traffic as free flowing", () => {
  expect(colorBusPath(path, [])[0].color).toBe(TRAFFIC_COLORS.UNKNOWN);
});
it("ignores traffic from roads in the opposite direction", () => {
  expect(
    colorBusPath(path, [{ path: [...path].reverse(), speed: "TRAFFIC_JAM" }])[0]
      .color,
  ).toBe(TRAFFIC_COLORS.UNKNOWN);
});
