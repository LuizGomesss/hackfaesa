"use client";

import { useEffect, useRef, useState } from "react";
import {
  AUTH_ERROR_EVENT,
  loadGoogleMaps,
} from "@/shared/lib/google-maps/load-google-maps";
import { ESTILO_MAPA } from "../config/map-config";

export function useMapInstance(
  { lat, lng }: google.maps.LatLngLiteral,
  zoom: number,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMap, setActiveMap] = useState<google.maps.Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
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
      mapRef.current = null;
      container?.replaceChildren();
    };
  }, [lat, lng, zoom]);

  return { containerRef, mapRef, activeMap, status, error };
}
