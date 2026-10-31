// OverlayView supports local map styles without requiring a Map ID.
export function createHtmlMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  element: HTMLElement,
  interactive = false,
) {
  class HtmlMarker extends google.maps.OverlayView {
    onAdd() {
      if (interactive)
        google.maps.OverlayView.preventMapHitsAndGesturesFrom(element);
      this.getPanes()?.overlayMouseTarget.append(element);
    }
    draw() {
      const pixel = this.getProjection().fromLatLngToDivPixel(
        new google.maps.LatLng(position),
      );
      if (!pixel) return;
      element.style.left = `${pixel.x}px`;
      element.style.top = `${pixel.y}px`;
    }
    onRemove() {
      element.remove();
    }
  }
  element.style.position = "absolute";
  const marker = new HtmlMarker();
  marker.setMap(map);
  return marker;
}
