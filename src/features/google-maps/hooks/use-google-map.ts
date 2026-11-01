"use client";

import { useCallback } from "react";
import { CENTRO_PADRAO, ZOOM_PADRAO } from "../config/map-config";
import type { LocalViagem } from "../model/place";
import { useBusStops } from "./use-bus-stops";
import { useMapInstance } from "./use-map-instance";
import { useTripRoute } from "./use-trip-route";

const LOCAL_VAZIO: LocalViagem = { texto: "" };

interface GoogleMapOptions {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  origem?: LocalViagem;
  destino?: LocalViagem;
}

export function useGoogleMap({
  center = CENTRO_PADRAO,
  zoom = ZOOM_PADRAO,
  origem = LOCAL_VAZIO,
  destino = LOCAL_VAZIO,
}: GoogleMapOptions = {}) {
  const { lat, lng } = center;
  const { containerRef, mapRef, activeMap, status, error } = useMapInstance(
    center,
    zoom,
  );
  const readyMap = status === "ready" ? activeMap : null;
  const { boundsRef, locationStatus, routeReady } = useTripRoute(
    readyMap,
    origem,
    destino,
  );
  const busStopsStatus = useBusStops(readyMap, status === "ready", !routeReady);
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
  }, [lat, lng, zoom, boundsRef, mapRef]);

  return {
    containerRef,
    status,
    error,
    centralizar,
    locationStatus,
    busStopsStatus,
  };
}
