interface Coordinates {
  lat: number;
  lng: number;
}

export function distanceInMeters(from: Coordinates, to: Coordinates) {
  const radians = Math.PI / 180;
  const latitude = (to.lat - from.lat) * radians;
  const longitude = (to.lng - from.lng) * radians;
  const a =
    Math.sin(latitude / 2) ** 2 +
    Math.cos(from.lat * radians) *
      Math.cos(to.lat * radians) *
      Math.sin(longitude / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(Math.min(1, a)));
}
