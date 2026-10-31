import { importLibrary } from "@googlemaps/js-api-loader";
import { loadGoogleMaps } from "./load-google-maps";

export async function geocodeAddress(address: string) {
  await loadGoogleMaps();
  const { Geocoder } = await importLibrary("geocoding");
  const cep = /^\d{5}-?\d{3}$/.test(address.trim());
  try {
    const { results } = await new Geocoder().geocode({
      ...(cep
        ? {
            componentRestrictions: {
              country: "BR",
              postalCode: address.replace(/\D/g, ""),
            },
          }
        : { address, componentRestrictions: { country: "BR" } }),
      region: "BR",
    });
    if (!results[0]) throw new Error("ZERO_RESULTS");
    return results[0].geometry.location;
  } catch (cause) {
    const code =
      cause && typeof cause === "object" && "code" in cause
        ? String(cause.code)
        : cause instanceof Error
          ? cause.message
          : "";
    if (code.includes("ZERO_RESULTS"))
      throw new Error(
        "Endereço ou CEP não encontrado. Inclua cidade e estado no endereço.",
      );
    if (code.includes("REQUEST_DENIED"))
      throw new Error(
        "Ative a Geocoding API e permita seu uso na chave do Google Cloud.",
      );
    throw new Error("Não foi possível localizar o endereço. Tente novamente.");
  }
}
