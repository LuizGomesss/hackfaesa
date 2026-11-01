import { beforeEach, expect, it, vi } from "vitest";
import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import type { PlaceSuggestion } from "../model/place";
import { createPlaceSearch } from "./place-search";

vi.mock("@/shared/lib/google-maps/load-google-maps", () => ({
  loadGooglePlaces: vi.fn(),
}));

const fetchAutocompleteSuggestions = vi.fn();

beforeEach(() => {
  fetchAutocompleteSuggestions.mockReset();
  vi.mocked(loadGooglePlaces).mockResolvedValue({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: { fetchAutocompleteSuggestions },
  } as unknown as google.maps.PlacesLibrary);
});

it("maps predictions and ignores suggestions without a place", async () => {
  fetchAutocompleteSuggestions.mockResolvedValue({
    suggestions: [
      {
        placePrediction: {
          placeId: "a",
          mainText: { text: "Univale" },
          secondaryText: { text: "Governador Valadares" },
          text: { text: "Univale, Governador Valadares" },
        },
      },
      { placePrediction: null },
    ],
  });
  const results = await createPlaceSearch().suggest("univ");
  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({
    id: "a",
    titulo: "Univale",
    detalhe: "Governador Valadares",
    texto: "Univale, Governador Valadares",
  });
  expect(fetchAutocompleteSuggestions).toHaveBeenCalledWith(
    expect.objectContaining({ input: "univ", includedRegionCodes: ["br"] }),
  );
});

it("keeps the token while typing and renews it after a selection", async () => {
  fetchAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
  const search = createPlaceSearch();
  await search.suggest("un");
  await search.suggest("uni");
  const [first, second] = fetchAutocompleteSuggestions.mock.calls.map(
    ([request]) => request.sessionToken,
  );
  expect(second).toBe(first);

  const location = { toJSON: () => ({ lat: -18.8, lng: -41.9 }) };
  const suggestion = {
    texto: "Univale",
    prediction: {
      toPlace: () => ({ fetchFields: async () => ({ place: { location } }) }),
    },
  } as unknown as PlaceSuggestion;
  expect(await search.select(suggestion)).toEqual({
    texto: "Univale",
    location: { lat: -18.8, lng: -41.9 },
  });

  await search.suggest("cen");
  expect(fetchAutocompleteSuggestions.mock.calls[2][0].sessionToken).not.toBe(
    first,
  );
});
