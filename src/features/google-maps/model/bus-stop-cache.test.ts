import { describe, expect, it, vi } from "vitest";
import type { BusStopSearchResult } from "./bus-stop";
import { createBusStopCache } from "./bus-stop-cache";

const result = (...ids: string[]): BusStopSearchResult => ({
  limited: false,
  stops: ids.map((id) => ({ id, name: id, lat: -20.3, lng: -40.3 })),
});

describe("page bus stop cache", () => {
  it("reuses visited searches and accumulates unique points across regions", async () => {
    const cache = createBusStopCache();
    const fetchA = vi.fn(async () => result("shared", "a"));
    await cache.load("area-a", fetchA);
    await cache.load("area-b", async () => result("shared", "b"));
    await cache.load("area-a", fetchA);
    expect(fetchA).toHaveBeenCalledTimes(1);
    expect([...cache.values()].map((stop) => stop.id)).toEqual([
      "shared",
      "a",
      "b",
    ]);
  });

  it("deduplicates pending searches and retains results when another region loads", async () => {
    const cache = createBusStopCache();
    let finish!: (value: BusStopSearchResult) => void;
    const fetchStops = vi.fn(
      () =>
        new Promise<BusStopSearchResult>((resolve) => {
          finish = resolve;
        }),
    );
    const first = cache.load("a", fetchStops);
    const duplicate = cache.load("a", fetchStops);
    await cache.load("b", async () => result("b"));
    finish(result("a"));
    await Promise.all([first, duplicate]);
    expect(fetchStops).toHaveBeenCalledTimes(1);
    expect([...cache.values()].map((stop) => stop.id)).toEqual(["b", "a"]);
  });

  it("allows retry after failure without deleting existing points", async () => {
    const cache = createBusStopCache();
    await cache.load("a", async () => result("a"));
    await expect(
      cache.load("b", async () => {
        throw new Error("timeout");
      }),
    ).rejects.toThrow("timeout");
    expect([...cache.values()]).toHaveLength(1);
    await cache.load("b", async () => result("b"));
    expect([...cache.values()]).toHaveLength(2);
  });

  it("caches empty results and keeps page sessions isolated", async () => {
    const first = createBusStopCache();
    const fetchStops = vi.fn(async () => result());
    await first.load("empty", fetchStops);
    await first.load("empty", fetchStops);
    expect(fetchStops).toHaveBeenCalledTimes(1);
    await first.load("a", async () => result("a"));
    expect([...createBusStopCache().values()]).toEqual([]);
  });
});
