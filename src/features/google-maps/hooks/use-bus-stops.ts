"use client";

import { useEffect, useRef, useState } from "react";
import { debounce } from "@/shared/lib/debounce";
import { searchBusStops } from "../api/search-bus-stops";
import { createBusStopCache } from "../model/bus-stop-cache";
import { getBusStopSearch } from "../model/bus-stop-search";
import { createBusStopLayer } from "../ui/create-bus-stop-layer";

export function useBusStops(map: google.maps.Map | null, ready: boolean) {
  const [message, setMessage] = useState("");
  const cacheRef = useRef<ReturnType<typeof createBusStopCache> | null>(null);
  if (!cacheRef.current) cacheRef.current = createBusStopCache();

  useEffect(() => {
    if (!ready || !map) return;
    const activeMap = map;
    const session = cacheRef.current;
    if (!session) return;
    let disposed = false;
    const layer = createBusStopLayer(activeMap);
    for (const stop of session.values()) layer.add(stop);

    const update = async () => {
      const search = getBusStopSearch(activeMap);
      if (!search) return;
      try {
        const result = await session.load(search.key, () =>
          searchBusStops(search),
        );
        if (disposed) return;
        result.stops.forEach(layer.add);
        setMessage(
          `${result.stops.length} pontos de ônibus encontrados${result.limited ? " · Aproxime para detalhar" : ""}`,
        );
      } catch (error) {
        if (disposed) return;
        console.error(
          "[bus-stops] Falha no Google Places. Verifique a ativação da Places API (New), as restrições da chave e o faturamento.",
          error,
        );
        setMessage("");
      }
    };

    const schedule = debounce(() => {
      void update();
    }, 800);
    const listener = activeMap.addListener("idle", schedule);
    schedule();
    return () => {
      disposed = true;
      schedule.cancel();
      listener.remove();
      layer.dispose();
    };
  }, [map, ready]);
  return message;
}
