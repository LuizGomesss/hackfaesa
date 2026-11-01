"use client";

import { useEffect, useRef, useState } from "react";
import { computeBusRoute } from "../api/compute-bus-route";
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
  useEffect(() => {
    if (!map) return;
    const activeMap = map;
    let cancelled = false;
    const routeLines: google.maps.Polyline[] = [];
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
              routeLines.push(
                new google.maps.Polyline({
                  map: activeMap,
                  path: segment.path,
                  strokeColor:
                    segment.mode === "WALKING" ? "#ffffff" : "#1269df",
                  strokeWeight: 5,
                  strokeOpacity: 1,
                  zIndex: segment.mode === "WALKING" ? 2 : 1,
                  clickable: false,
                }),
              );
            }
            markers.push(
              createLocationMarker(
                activeMap,
                trip.boarding.location,
                `Embarque: ${trip.boarding.name}`,
                "#1269df",
              ),
              createLocationMarker(
                activeMap,
                trip.alighting.location,
                `Desembarque: ${trip.alighting.name}`,
                "#1269df",
              ),
            );
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
      routeLines.forEach((line) => {
        line.setMap(null);
      });
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [origem, destino, map]);

  return { boundsRef, locationStatus };
}
