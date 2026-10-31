export interface BusStop {
  id: string;
  lat: number;
  lng: number;
  name: string;
}
export interface BusStopSearch {
  key: string;
  bounds: google.maps.LatLngBounds;
  center: google.maps.LatLngLiteral;
  radius: number;
}
export interface BusStopSearchResult {
  stops: BusStop[];
  limited: boolean;
}
