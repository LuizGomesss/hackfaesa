import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import { CENTRO_PADRAO } from "../config/map-config";
import type { LocalViagem, PlaceSuggestion } from "../model/place";

const RAIO_PREFERENCIA_METROS = 50000;

// O token agrupa as consultas digitadas e a escolha em uma única sessão de cobrança.
export function createPlaceSearch() {
  let sessionToken: google.maps.places.AutocompleteSessionToken | undefined;

  async function suggest(input: string): Promise<PlaceSuggestion[]> {
    const { AutocompleteSessionToken, AutocompleteSuggestion } =
      await loadGooglePlaces();
    sessionToken ??= new AutocompleteSessionToken();
    const { suggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken,
        includedRegionCodes: ["br"],
        language: "pt-BR",
        region: "br",
        locationBias: {
          center: CENTRO_PADRAO,
          radius: RAIO_PREFERENCIA_METROS,
        },
      });
    return suggestions.flatMap(({ placePrediction: prediction }) =>
      prediction
        ? [
            {
              id: prediction.placeId,
              titulo: prediction.mainText?.text ?? prediction.text.text,
              detalhe: prediction.secondaryText?.text ?? "",
              texto: prediction.text.text,
              prediction,
            },
          ]
        : [],
    );
  }

  async function select(suggestion: PlaceSuggestion): Promise<LocalViagem> {
    sessionToken = undefined;
    const { place } = await suggestion.prediction
      .toPlace()
      .fetchFields({ fields: ["location"] });
    return { texto: suggestion.texto, location: place.location?.toJSON() };
  }

  return { suggest, select };
}
