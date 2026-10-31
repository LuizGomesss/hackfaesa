import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export const AUTH_ERROR_EVENT = "google-maps-auth-error";
let library: Promise<google.maps.MapsLibrary> | undefined;

export function loadGoogleMaps(): Promise<google.maps.MapsLibrary> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("O mapa precisa ser carregado no navegador."),
    );
  }
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(
      new Error("A chave do Google Maps não foi configurada."),
    );
  }
  if (!library) {
    const mapsWindow = window as Window & { gm_authFailure?: () => void };
    mapsWindow.gm_authFailure = () => {
      window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
    };
    setOptions({ key, v: "weekly", language: "pt-BR", region: "BR" });
    library = importLibrary("maps").catch(() => {
      library = undefined;
      throw new Error("Não foi possível conectar ao Google Maps.");
    });
  }
  return library;
}
