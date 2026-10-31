// OverlayView preserva o estilo local do mapa sem exigir um Map ID.
export function createLocationMarker(
  map: google.maps.Map,
  position: google.maps.LatLng,
  label: string,
  color: string,
) {
  class LocationMarker extends google.maps.OverlayView {
    private element = document.createElement("div");
    onAdd() {
      this.element.setAttribute("role", "img");
      this.element.setAttribute("aria-label", label);
      this.element.title = label;
      this.element.textContent = label;
      Object.assign(this.element.style, {
        position: "absolute",
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
      this.getPanes()?.overlayMouseTarget.append(this.element);
    }
    draw() {
      const pixel = this.getProjection().fromLatLngToDivPixel(position);
      if (!pixel) return;
      this.element.style.left = `${pixel.x}px`;
      this.element.style.top = `${pixel.y}px`;
    }
    onRemove() {
      this.element.remove();
    }
  }
  const marker = new LocationMarker();
  marker.setMap(map);
  return marker;
}
