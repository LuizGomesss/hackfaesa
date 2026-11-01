import { distanceInMeters } from "@/shared/lib/geo/distance-in-meters";
import type { RouteCandidate } from "./route-candidate";
import { walkingDistance } from "./route-candidate";

export interface TransferTerminal {
  name: string;
  location: google.maps.LatLngLiteral;
  waypoint: google.maps.places.Place | google.maps.LatLngLiteral;
}

export function terminalIdentity(name = "") {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bt\s*\.\s*/g, "terminal ")
    .trim();
  if (/\b(frente|fora|extern[ao]|opost[ao]|proximo|acesso)\b/.test(normalized))
    return null;
  const match = normalized.match(/^terminal\s+(?:de\s+|do\s+|da\s+)?(.+)/);
  if (!match) return null;
  // Some platforms use the official name while Places uses the neighborhood:
  // "Terminal Urbano ... (Jardim América)" and "Terminal Jardim América".
  const alias = /^terminal urbano\b/.test(normalized)
    ? normalized.match(/\(([^)]+)\)/)?.[1]
    : undefined;
  const identity = (alias ?? match[1])
    .split(/\b(plataforma|baia|embarque|desembarque|ponto)\b|[|(/]/)[0]
    .replace(/\s*[-–]\s*\w?\d+.*$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return identity || null;
}

export function stopInTerminal(
  stop: google.maps.routes.TransitStop | null | undefined,
  terminal: TransferTerminal,
) {
  const identity = terminalIdentity(stop?.name ?? "");
  return (
    !!stop?.location &&
    !!identity &&
    identity === terminalIdentity(terminal.name) &&
    distanceInMeters(stop.location, terminal.location) <= 500
  );
}

export function transferCost(candidate: RouteCandidate) {
  let outsideTerminal = 0;
  let walkingMeters = 0;
  for (let index = 1; index < candidate.buses.length; index++) {
    const previous = candidate.buses[index - 1];
    const next = candidate.buses[index];
    const arrival = previous.transitDetails?.arrivalStop;
    const departure = next.transitDetails?.departureStop;
    const walks = candidate.steps.slice(
      candidate.steps.indexOf(previous) + 1,
      candidate.steps.indexOf(next),
    );
    const meters = walkingDistance(walks);
    walkingMeters += meters;
    const identity = terminalIdentity(arrival?.name ?? "");
    const internal =
      identity &&
      identity === terminalIdentity(departure?.name ?? "") &&
      !!arrival?.location &&
      !!departure?.location &&
      distanceInMeters(arrival.location, departure.location) <= 500 &&
      meters <= 600;
    if (!internal) outsideTerminal++;
  }
  return { outsideTerminal, walkingMeters };
}
