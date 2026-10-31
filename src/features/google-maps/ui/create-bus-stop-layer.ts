import { createHtmlMarker } from "@/shared/lib/google-maps/create-html-marker";
import type { BusStop } from "../model/bus-stop";

export function createBusStopLayer(map: google.maps.Map) {
  const markers = new Map<string, google.maps.OverlayView>();
  const info = new google.maps.InfoWindow();
  function add(stop: BusStop) {
    if (markers.has(stop.id)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.title = stop.name;
    button.setAttribute("aria-label", stop.name);
    button.textContent = "🚏";
    Object.assign(button.style, {
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
    button.onclick = () => {
      const content = document.createElement("div");
      content.textContent = stop.name;
      info.setContent(content);
      info.setPosition({ lat: stop.lat, lng: stop.lng });
      info.open({ map });
    };
    markers.set(stop.id, createHtmlMarker(map, stop, button, true));
  }
  return {
    add,
    dispose() {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers.clear();
      info.close();
    },
  };
}
