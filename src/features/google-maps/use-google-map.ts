"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_ERROR_EVENT, loadGoogleMaps } from "./load-google-maps";
import { CENTRO_PADRAO, ZOOM_PADRAO } from "./map-config";

export function useGoogleMap({
  center = CENTRO_PADRAO,
  zoom = ZOOM_PADRAO,
}: {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const { lat, lng } = center;

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
          gestureHandling: "greedy",
          clickableIcons: false,
          keyboardShortcuts: true,
        });
        mapRef.current = map;
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

  const centralizar = useCallback(() => {
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(zoom);
  }, [lat, lng, zoom]);

  return { containerRef, status, error, centralizar };
}
