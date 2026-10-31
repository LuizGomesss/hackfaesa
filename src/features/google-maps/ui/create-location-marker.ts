import { createHtmlMarker } from "@/shared/lib/google-maps/create-html-marker";

export function createLocationMarker(
  map: google.maps.Map,
  position: google.maps.LatLng,
  label: string,
  color: string,
) {
  const element = document.createElement("div");
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", label);
  element.title = label;
  element.textContent = label;
  Object.assign(element.style, {
    transform: "translate(-50%, -100%)",
    padding: "8px 12px",
    border: "3px solid white",
    borderRadius: "20px 20px 20px 0",
    background: color,
    color: "white",
    font: "600 12px Arial",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px #0003",
  });
  return createHtmlMarker(map, position.toJSON(), element);
}
