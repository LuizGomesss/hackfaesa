"use client";

import { useEffect, useState } from "react";

interface BusStop {
  id: string;
  lat: number;
  lng: number;
  name: string;
  ref: string | null;
}

export function useBusStops(map: google.maps.Map | null, ready: boolean) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!ready || !map) return;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    let markers: google.maps.OverlayView[] = [];
    const info = new google.maps.InfoWindow();
    const clear = () => {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
      info.close();
    };
    const update = () => {
      clearTimeout(timer);
      controller?.abort();
      timer = setTimeout(async () => {
        const bounds = map.getBounds();
        if (!bounds) return;
        const { south, west, north, east } = bounds.toJSON();
        if (
          (map.getZoom() ?? 0) < 13 ||
          north - south > 0.15 ||
          east - west > 0.15 ||
          west >= east
        ) {
          clear();
          setMessage("Aproxime o mapa para ver os pontos de ônibus.");
          return;
        }
        const current = new AbortController();
        controller = current;
        clear();
        setMessage("Carregando pontos de ônibus…");
        try {
          const bbox = [south, west, north, east].join(",");
          const response = await fetch(`/api/bus-stops?bbox=${bbox}`, {
            signal: current.signal,
          });
          if (!response.ok) {
            const body = await response.text();
            console.error("[bus-stops] Erro na API de pontos de ônibus", {
              url: response.url,
              status: response.status,
              statusText: response.statusText,
              response: body,
            });
            setMessage("");
            return;
          }
          const { stops } = (await response.json()) as { stops: BusStop[] };
          if (current.signal.aborted) return;
          markers = stops.map((stop) => {
            class StopMarker extends google.maps.OverlayView {
              private button = document.createElement("button");
              onAdd() {
                this.button.type = "button";
                this.button.title = stop.name;
                this.button.setAttribute("aria-label", stop.name);
                this.button.textContent = "🚏";
                Object.assign(this.button.style, {
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  width: "30px",
                  height: "30px",
                  border: "2px solid white",
                  borderRadius: "50%",
                  background: "#1269df",
                  fontSize: "18px",
                  cursor: "pointer",
                  boxShadow: "0 1px 5px #0004",
                });
                google.maps.OverlayView.preventMapHitsAndGesturesFrom(
                  this.button,
                );
                this.button.onclick = () => {
                  const content = document.createElement("div");
                  content.textContent = stop.ref
                    ? `${stop.name} · ${stop.ref}`
                    : stop.name;
                  info.setContent(content);
                  info.setPosition({ lat: stop.lat, lng: stop.lng });
                  info.open({ map });
                };
                this.getPanes()?.overlayMouseTarget.append(this.button);
              }
              draw() {
                const pixel = this.getProjection().fromLatLngToDivPixel(
                  new google.maps.LatLng(stop.lat, stop.lng),
                );
                if (!pixel) return;
                this.button.style.left = `${pixel.x}px`;
                this.button.style.top = `${pixel.y}px`;
              }
              onRemove() {
                this.button.remove();
              }
            }
            const marker = new StopMarker();
            marker.setMap(map);
            return marker;
          });
          setMessage(
            stops.length
              ? `${stops.length} pontos de ônibus nesta área`
              : "Nenhum ponto cadastrado no OpenStreetMap nesta área.",
          );
        } catch (error) {
          if (!current.signal.aborted) {
            console.error(
              "[bus-stops] Falha ao carregar pontos de ônibus",
              error,
            );
            setMessage("");
          }
        }
      }, 500);
    };
    const listener = map.addListener("idle", update);
    update();
    return () => {
      clearTimeout(timer);
      controller?.abort();
      listener.remove();
      clear();
    };
  }, [map, ready]);
  return message;
}
