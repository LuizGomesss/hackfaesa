import type { BusStop, BusStopSearchResult } from "./bus-stop";

// Owned by the hook: no storage or cache shared between page visits.
export function createBusStopCache() {
  const stops = new Map<string, BusStop>();
  const searches = new Map<string, BusStopSearchResult>();
  const pending = new Map<string, Promise<BusStopSearchResult>>();

  async function load(
    key: string,
    fetchStops: () => Promise<BusStopSearchResult>,
  ) {
    const cached = searches.get(key);
    if (cached) return cached;
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;
    const request = Promise.resolve()
      .then(fetchStops)
      .then((result) => {
        result.stops.forEach((stop) => {
          stops.set(stop.id, stop);
        });
        searches.set(key, result);
        return result;
      })
      .finally(() => {
        pending.delete(key);
      });
    pending.set(key, request);
    return request;
  }

  return { values: () => stops.values(), load };
}
