"use client";

import { useEffect, useRef, useState } from "react";
import { getBusTraffic } from "../api/bus-traffic";
import { computeBusRoute, type TripSummary } from "../api/compute-bus-route";
import { geocodeAddress } from "../api/geocode-address";
import type { LocalViagem } from "../model/place";
import { createLocationMarker } from "../ui/create-location-marker";

async function resolveLocation({ texto, location }: LocalViagem) {
  return location ? new google.maps.LatLng(location) : geocodeAddress(texto);
}

export function useTripRoute(
  map: google.maps.Map | null,
  origem: LocalViagem,
  destino: LocalViagem,
) {
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [routeReady, setRouteReady] = useState(false);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  useEffect(() => {
    setRouteReady(false);
    setSummary(null);
    if (!map) return;
    const activeMap = map;
    let cancelled = false;
    const routeLines: google.maps.Polyline[] = [];
    const walkingLines: google.maps.Polyline[] = [];
    let animationTimer: ReturnType<typeof setInterval> | undefined;
    const trafficTimers: ReturnType<typeof setInterval>[] = [];
    const trafficGroups: google.maps.Polyline[][] = [];
    const markers: google.maps.OverlayView[] = [];
    boundsRef.current = null;
    async function locate() {
      const addresses = [
        { label: "Origem", local: origem, color: "#0069ed" },
        { label: "Destino", local: destino, color: "#00964f" },
      ].filter((item) => item.local.texto.trim());
      if (!addresses.length) {
        setLocationStatus("");
        return;
      }
      setLocationStatus("Localizando endereços…");
      const results = await Promise.allSettled(
        addresses.map((item) => resolveLocation(item.local)),
      );
      if (cancelled) return;
      const bounds = new google.maps.LatLngBounds();
      const errors: string[] = [];
      results.forEach((result, index) => {
        const item = addresses[index];
        if (result.status === "fulfilled") {
          bounds.extend(result.value);
          markers.push(
            createLocationMarker(
              activeMap,
              result.value,
              item.label,
              item.color,
            ),
          );
        } else {
          errors.push(
            `${item.label}: ${result.reason instanceof Error ? result.reason.message : "Não foi possível localizar."}`,
          );
        }
      });
      const points = results
        .filter(
          (result): result is PromiseFulfilledResult<google.maps.LatLng> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      if (points.length === 2) {
        try {
          setLocationStatus("Calculando caminhada e trajeto de ônibus…");
          const trip = await computeBusRoute(points[0], points[1]);
          if (!cancelled) {
            for (const segment of trip.segments) {
              segment.path.forEach((point) => {
                bounds.extend(point);
              });
              if (segment.mode === "WALKING") {
                const walkingLine = new google.maps.Polyline({
                  map: activeMap,
                  path: segment.path,
                  strokeOpacity: 0,
                  icons: [
                    {
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 3.5,
                        fillColor: "#ffffff",
                        fillOpacity: 1,
                        strokeColor: "#526579",
                        strokeOpacity: 1,
                        strokeWeight: 1.5,
                      },
                      offset: "0px",
                      repeat: "20px",
                    },
                  ],
                  zIndex: 3,
                  clickable: false,
                });
                walkingLines.push(walkingLine);
                routeLines.push(walkingLine);
                continue;
              }
              let updating = false;
              const trafficLines: google.maps.Polyline[] = [];
              trafficGroups.push(trafficLines);
              async function updateTraffic() {
                if (updating) return;
                updating = true;
                const sections = await getBusTraffic(segment.path);
                updating = false;
                if (cancelled) return;
                trafficLines.forEach((line) => {
                  line.setMap(null);
                });
                trafficLines.length = 0;
                trafficLines.push(
                  ...sections.map(
                    (section) =>
                      new google.maps.Polyline({
                        map: activeMap,
                        path: section.path,
                        strokeColor: section.color,
                        strokeWeight: 6,
                        strokeOpacity: 1,
                        zIndex: 1,
                        clickable: false,
                      }),
                  ),
                );
              }
              trafficLines.push(
                new google.maps.Polyline({
                  map: activeMap,
                  path: segment.path,
                  strokeColor: "#64748b",
                  strokeWeight: 6,
                  clickable: false,
                }),
              );
              void updateTraffic();
              trafficTimers.push(
                setInterval(() => {
                  void updateTraffic();
                }, 120000),
              );
            }
            let offset = 0;
            animationTimer = setInterval(() => {
              offset = (offset + 0.8) % 20;
              for (const line of walkingLines) {
                const icons = line.get("icons") as google.maps.IconSequence[];
                line.set(
                  "icons",
                  icons.map((icon) => ({ ...icon, offset: `${offset}px` })),
                );
              }
            }, 40);
            for (const stop of trip.stops) {
              markers.push(
                createLocationMarker(
                  activeMap,
                  stop.location,
                  stop.label,
                  "#1269df",
                ),
              );
            }
            setRouteReady(true);
            setSummary(trip.summary);
          }
        } catch (error) {
          errors.push(
            error instanceof Error
              ? error.message
              : "Não foi possível calcular a viagem.",
          );
        }
      }
      if (cancelled) return;
      if (!bounds.isEmpty()) {
        boundsRef.current = bounds;
        if (
          markers.length === 1 ||
          bounds.getNorthEast().equals(bounds.getSouthWest())
        ) {
          activeMap.setCenter(bounds.getCenter());
          activeMap.setZoom(16);
        } else activeMap.fitBounds(bounds, 55);
      }
      setLocationStatus(errors.join(" "));
    }
    void locate();
    return () => {
      cancelled = true;
      if (animationTimer !== undefined) clearInterval(animationTimer);
      trafficTimers.forEach((timer) => {
        clearInterval(timer);
      });
      trafficGroups.flat().forEach((line) => {
        line.setMap(null);
      });
      routeLines.forEach((line) => {
        line.setMap(null);
      });
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [origem, destino, map]);

  return { boundsRef, locationStatus, routeReady, summary };
}
