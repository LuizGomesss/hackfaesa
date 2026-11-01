import DirectionsBus from "@mui/icons-material/DirectionsBus";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createHtmlMarker } from "@/shared/lib/google-maps/create-html-marker";
import type { BusStop } from "../model/bus-stop";

export function createBusStopLayer(map: google.maps.Map) {
  const markers = new Map<
    string,
    { marker: google.maps.OverlayView; root: Root; button: HTMLButtonElement }
  >();
  const info = new google.maps.InfoWindow();
  let visible = true;
  function add(stop: BusStop) {
    if (markers.has(stop.id)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.title = stop.name;
    button.setAttribute("aria-label", stop.name);
    Object.assign(button.style, {
      transform: "translate(-50%, -50%)",
      display: visible ? "grid" : "none",
      placeItems: "center",
      boxSizing: "border-box",
      width: "40px",
      height: "40px",
      padding: "0",
      border: "4px solid white",
      borderRadius: "50%",
      background: "#233b54",
      color: "white",
      cursor: "pointer",
      boxShadow: "0 1px 4px #0003",
    });
    const root = createRoot(button);
    root.render(
      createElement(DirectionsBus, {
        style: { fontSize: 26 },
        "aria-hidden": true,
      }),
    );
    button.onclick = () => {
      const content = document.createElement("div");
      content.textContent = stop.name;
      info.setContent(content);
      info.setPosition({ lat: stop.lat, lng: stop.lng });
      info.open({ map });
    };
    markers.set(stop.id, {
      marker: createHtmlMarker(map, stop, button, true),
      root,
      button,
    });
  }
  return {
    add,
    setVisible(value: boolean) {
      visible = value;
      if (!visible) info.close();
      markers.forEach(({ button }) => {
        button.style.display = visible ? "grid" : "none";
      });
    },
    dispose() {
      markers.forEach(({ marker, root }) => {
        root.unmount();
        marker.setMap(null);
      });
      markers.clear();
      info.close();
    },
  };
}
