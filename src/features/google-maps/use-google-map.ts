"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createLocationMarker } from "./create-location-marker";
import { geocodeAddress } from "./geocode-address";
import {
  AUTH_ERROR_EVENT,
  loadGoogleMaps,
  loadGoogleRoutes,
} from "./load-google-maps";
import { CENTRO_PADRAO, ESTILO_MAPA, ZOOM_PADRAO } from "./map-config";
import { useBusStops } from "./use-bus-stops";

export function useGoogleMap({
  center = CENTRO_PADRAO,
  zoom = ZOOM_PADRAO,
  origem = "",
  destino = "",
}: {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  origem?: string;
  destino?: string;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMap, setActiveMap] = useState<google.maps.Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const { lat, lng } = center;
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
  const busStopsStatus = useBusStops(activeMap, status === "ready");

  useEffect(() => {
    let cancelled = false;
    let map: google.maps.Map | undefined;
    const onAuthError = () => {
      if (cancelled) return;
      setError(
        "O Google Maps não autorizou o carregamento. Verifique a chave, os domínios e o faturamento no Google Cloud.",
      );
      setStatus("error");
    };
    window.addEventListener(AUTH_ERROR_EVENT, onAuthError);
    async function initialize() {
      try {
        const { Map: GoogleMap } = await loadGoogleMaps();
        if (cancelled || !containerRef.current) return;
        map = new GoogleMap(containerRef.current, {
          center: { lat, lng },
          zoom,
          disableDefaultUI: true,
          mapTypeId: "roadmap",
          styles: ESTILO_MAPA,
          gestureHandling: "greedy",
          clickableIcons: false,
          keyboardShortcuts: true,
        });
        mapRef.current = map;
        setActiveMap(map);
        const { Polyline } = await loadGoogleMaps();
        routeLineRef.current = new Polyline({
          map,
          strokeColor: "#1269df",
          strokeWeight: 5,
          strokeOpacity: 0.9,
          clickable: false,
        });
        setStatus("ready");
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar o mapa.",
        );
        setStatus("error");
      }
    }
    void initialize();
    const container = containerRef.current;
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_ERROR_EVENT, onAuthError);
      if (map) google.maps.event.clearInstanceListeners(map);
      routeLineRef.current?.setMap(null);
      routeLineRef.current = null;
      mapRef.current = null;
      container?.replaceChildren();
    };
  }, [lat, lng, zoom]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const map = mapRef.current;
    let cancelled = false;
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
            createLocationMarker(map, result.value, item.label, item.color),
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
      if (points.length === 2 && routeLineRef.current) {
        try {
          const { Route } = await loadGoogleRoutes();
          const request: google.maps.routes.ComputeRoutesRequest = {
            origin: points[0],
            destination: points[1],
            travelMode: google.maps.TravelMode.TRANSIT,
            transitPreference: {
              allowedTransitModes: ["BUS"],
              routingPreference: "FEWER_TRANSFERS",
            },
            fields: ["path", "legs", "localizedValues", "travelAdvisory"],
          };
          const response = await Route.computeRoutes(request);
          const route = response.routes?.[0];
          if (!route?.path?.length) {
            throw new Error(
              "O Google não encontrou uma rota de transporte público entre esses pontos.",
            );
          }
          if (!cancelled) {
            routeLineRef.current?.setPath(
              route.path.map((point) => ({ lat: point.lat, lng: point.lng })),
            );
            setLocationStatus("");
          }
        } catch {
          if (!cancelled)
            setLocationStatus(
              "Não foi possível calcular uma rota de transporte público entre os pontos.",
            );
        }
      }
      if (!bounds.isEmpty()) {
        boundsRef.current = bounds;
        if (
          markers.length === 1 ||
          bounds.getNorthEast().equals(bounds.getSouthWest())
        ) {
          map.setCenter(bounds.getCenter());
          map.setZoom(16);
        } else map.fitBounds(bounds, 55);
      }
      setLocationStatus(errors.join(" "));
    }
    void locate();
    return () => {
      cancelled = true;
      routeLineRef.current?.setPath([]);
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [origem, destino, status]);

  const centralizar = useCallback(() => {
    if (boundsRef.current) {
      if (
        boundsRef.current
          .getNorthEast()
          .equals(boundsRef.current.getSouthWest())
      ) {
        mapRef.current?.panTo(boundsRef.current.getCenter());
        mapRef.current?.setZoom(16);
      } else mapRef.current?.fitBounds(boundsRef.current, 55);
      return;
    }
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(zoom);
  }, [lat, lng, zoom]);

  return {
    containerRef,
    status,
    error,
    centralizar,
    locationStatus,
    busStopsStatus,
  };
}
