import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import type {
  RouteCandidate,
  TransitRouteData,
} from "../model/route-candidate";
import {
  candidateFromRoute,
  finalArrival,
  isReachable,
  routeDuration,
  walkingDistance,
} from "../model/route-candidate";
import type { TransferTerminal } from "../model/transfer-terminal";
import {
  stopInTerminal,
  terminalIdentity,
  transferCost,
} from "../model/transfer-terminal";
import { searchTransferTerminals } from "./search-transfer-terminals";

type ComputeRoutes = (
  request: google.maps.routes.ComputeRoutesRequest,
) => Promise<{ routes?: TransitRouteData[] }>;
const CONNECTION_BUFFER = 3 * 60000;
const MAX_TERMINALS = 2;

export async function computeTerminalRoutes(
  seeds: RouteCandidate[],
  request: google.maps.routes.ComputeRoutesRequest,
  computeRoutes: ComputeRoutes,
  startedAt: number,
): Promise<RouteCandidate[]> {
  const targets: TransferTerminal[] = [];
  const anonymousCenters: google.maps.LatLngLiteral[] = [];
  const deadlines = new Map<string, number>();
  function addTarget(
    stop: google.maps.routes.TransitStop | null | undefined,
    deadline?: number,
  ) {
    const identity = terminalIdentity(stop?.name ?? "");
    if (!identity || !stop?.location) return false;
    if (!targets.some((target) => terminalIdentity(target.name) === identity)) {
      targets.push({
        name: stop.name ?? "",
        location: stop.location,
        waypoint: stop.location,
      });
    }
    if (deadline != null && Number.isFinite(deadline))
      deadlines.set(identity, deadline);
    return true;
  }
  for (const candidate of seeds) {
    if (!transferCost(candidate).outsideTerminal) continue;
    for (let index = 1; index < candidate.buses.length; index++) {
      const arrival = candidate.buses[index - 1].transitDetails?.arrivalStop;
      const departure = candidate.buses[index].transitDetails?.departureStop;
      const deadline =
        candidate.buses[index].transitDetails?.departureTime?.getTime();
      const namedDeparture = addTarget(departure, deadline);
      const namedArrival = addTarget(arrival, deadline);
      if (
        !namedDeparture &&
        !namedArrival &&
        departure?.location &&
        !anonymousCenters.some(
          (center) =>
            distanceInMeters(
              center,
              departure.location as google.maps.LatLngLiteral,
            ) < 750,
        )
      ) {
        anonymousCenters.push(departure.location);
      }
    }
  }
  // Places resolves a facility when Google labels its platforms only by a
  // street or stop number. A failed lookup must not discard the base routes.
  if (anonymousCenters.length) {
    const discovered = await searchTransferTerminals(anonymousCenters).catch(
      () => [],
    );
    for (const terminal of discovered) {
      if (
        !targets.some(
          (target) =>
            terminalIdentity(target.name) === terminalIdentity(terminal.name),
        )
      )
        targets.push(terminal);
    }
  }
  const results = await Promise.allSettled(
    targets.slice(0, MAX_TERMINALS).map(async (terminal) => {
      const base = { ...request, destination: terminal.waypoint };
      const accessResponses = await Promise.allSettled([
        computeRoutes(base),
        computeRoutes({
          ...base,
          transitPreference: {
            allowedTransitModes: ["BUS"],
            routingPreference: "FEWER_TRANSFERS",
          },
        }),
      ]);
      function accessCandidates(routes: TransitRouteData[]) {
        const unique = new Map<string, RouteCandidate>();
        for (const route of routes) {
          const candidate = candidateFromRoute(route);
          if (
            !candidate ||
            !isReachable(candidate, startedAt) ||
            finalArrival(candidate) == null
          )
            continue;
          const lastBus = candidate.buses[candidate.buses.length - 1];
          if (
            !stopInTerminal(lastBus.transitDetails?.arrivalStop, terminal) ||
            walkingDistance(
              candidate.steps.slice(candidate.steps.indexOf(lastBus) + 1),
            ) > 300
          )
            continue;
          const key = candidate.buses
            .map(
              (bus) =>
                `${bus.transitDetails?.transitLine?.shortName}:${bus.transitDetails?.departureTime?.getTime()}`,
            )
            .join("/");
          unique.set(key, candidate);
        }
        return [...unique.values()]
          .sort(
            (a, b) =>
              transferCost(a).outsideTerminal -
                transferCost(b).outsideTerminal ||
              routeDuration(a, startedAt) - routeDuration(b, startedAt),
          )
          .slice(0, 2);
      }
      let access = accessCandidates(
        accessResponses.flatMap((response) =>
          response.status === "fulfilled" ? (response.value.routes ?? []) : [],
        ),
      );
      const deadline = deadlines.get(terminalIdentity(terminal.name) ?? "");
      if (
        !access.length &&
        deadline != null &&
        deadline - CONNECTION_BUFFER > startedAt
      ) {
        const { departureTime: _departureTime, ...arrivalRequest } = base;
        const response = await computeRoutes({
          ...arrivalRequest,
          arrivalTime: new Date(deadline - CONNECTION_BUFFER),
        }).catch(() => ({ routes: [] }));
        access = accessCandidates(response.routes ?? []);
      }
      const connections = await Promise.allSettled(
        access.map(async (incoming) => {
          // Recalculate the next bus after the real terminal arrival. Reusing the
          // original next bus could create a missed connection or a past departure.
          const readyAt =
            (finalArrival(incoming) as number) + CONNECTION_BUFFER;
          const onwardRequest = {
            ...request,
            origin: terminal.waypoint,
            departureTime: new Date(readyAt),
          };
          let response = await computeRoutes(onwardRequest).catch(() => ({
            routes: [],
          }));
          function join(routes: TransitRouteData[]) {
            return routes.flatMap((route) => {
              const outgoing = candidateFromRoute(route);
              if (
                !outgoing ||
                !isReachable(outgoing, readyAt) ||
                !stopInTerminal(
                  outgoing.buses[0].transitDetails?.departureStop,
                  terminal,
                )
              )
                return [];
              if (
                walkingDistance(
                  outgoing.steps.slice(
                    0,
                    outgoing.steps.indexOf(outgoing.buses[0]),
                  ),
                ) > 300
              )
                return [];
              const arrival = finalArrival(outgoing);
              if (arrival == null) return [];
              // A fare for one half of the journey is not a fare for the whole trip.
              const candidate = candidateFromRoute({
                legs: [
                  ...(incoming.route.legs ?? []),
                  ...(outgoing.route.legs ?? []),
                ],
                durationMillis: arrival - startedAt,
                warnings: [
                  ...new Set([
                    ...(incoming.route.warnings ?? []),
                    ...(outgoing.route.warnings ?? []),
                  ]),
                ],
              });
              return candidate && isReachable(candidate, startedAt)
                ? [candidate]
                : [];
            });
          }
          let joined = join(response.routes ?? []);
          if (!joined.length) {
            response = await computeRoutes({
              ...onwardRequest,
              transitPreference: {
                allowedTransitModes: ["BUS"],
                routingPreference: "FEWER_TRANSFERS",
              },
            });
            joined = join(response.routes ?? []);
          }
          return joined;
        }),
      );
      return connections.flatMap((connection) =>
        connection.status === "fulfilled" ? connection.value : [],
      );
    }),
  );
  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
}
