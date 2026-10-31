"use client";

import { useEffect, useRef, useState } from "react";
import { computeBusRoute } from "../api/compute-bus-route";
import { geocodeAddress } from "../api/geocode-address";
import { createLocationMarker } from "../ui/create-location-marker";

export function useTripRoute(
  map: google.maps.Map | null,
  origem: string,
  destino: string,
) {
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  useEffect(() => {
    if (!map) return;
    const activeMap = map;
    let cancelled = false;
    const routeLine = new google.maps.Polyline({
      map,
      strokeColor: "#1269df",
      strokeWeight: 5,
      strokeOpacity: 0.9,
      clickable: false,
    });
    const markers: google.maps.OverlayView[] = [];
    boundsRef.current = null;
    async function locate() {
      const addresses = [
        { label: "Origem", address: origem.trim(), color: "#0069ed" },
        { label: "Destino", address: destino.trim(), color: "#00964f" },
      ].filter((item) => item.address);
      if (!addresses.length) {
        setLocationStatus("");
        return;
      }
      setLocationStatus("Localizando endereços…");
      const results = await Promise.allSettled(
        addresses.map((item) => geocodeAddress(item.address)),
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
          const path = await computeBusRoute(points[0], points[1]);
          if (!cancelled) {
            routeLine.setPath(path);
            setLocationStatus("");
          }
        } catch {
          if (!cancelled)
            setLocationStatus(
              "Não foi possível calcular uma rota de transporte público entre os pontos.",
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
      routeLine.setMap(null);
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [origem, destino, map]);

  return { boundsRef, locationStatus };
}
