import { loadGoogleRoutes } from "@/shared/lib/google-maps/load-google-maps";

export async function computeBusRoute(
  origin: google.maps.LatLng,
  destination: google.maps.LatLng,
) {
  const { Route } = await loadGoogleRoutes();
  const response = await Route.computeRoutes({
    origin,
    destination,
    travelMode: google.maps.TravelMode.TRANSIT,
    transitPreference: {
      allowedTransitModes: ["BUS"],
      routingPreference: "FEWER_TRANSFERS",
    },
    fields: ["path", "legs", "localizedValues", "travelAdvisory"],
  });
  const path = response.routes?.[0]?.path;
  if (!path?.length)
    throw new Error(
      "O Google não encontrou uma rota de transporte público entre esses pontos.",
    );
  return path.map((point) => ({ lat: point.lat, lng: point.lng }));
}
