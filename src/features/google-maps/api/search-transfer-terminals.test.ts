import { expect, it, vi } from "vitest";
import { loadGooglePlaces } from "@/shared/lib/google-maps/load-google-maps";
import { searchTransferTerminals } from "./search-transfer-terminals";

vi.mock("@/shared/lib/google-maps/load-google-maps", () => ({
  loadGooglePlaces: vi.fn(),
}));

it("keeps nearby terminals and excludes distant facilities and roadside stops", async () => {
  const place = (id: string, displayName: string, lng: number) => ({
    id,
    displayName,
    location: { toJSON: () => ({ lat: -20, lng }) },
  });
  const nearby = place("terminal", "Terminal Central", -40.001);
  const searchByText = vi.fn().mockResolvedValue({
    places: [
      nearby,
      place("far", "Terminal Distante", -41),
      place("roadside", "Em frente ao Terminal Central", -40.001),
      { id: "missing", displayName: "Terminal sem local" },
    ],
  });
  vi.mocked(loadGooglePlaces).mockResolvedValue({
    Place: { searchByText },
  } as unknown as google.maps.PlacesLibrary);
  const terminals = await searchTransferTerminals([{ lat: -20, lng: -40 }]);
  expect(terminals).toEqual([
    {
      name: "Terminal Central",
      location: { lat: -20, lng: -40.001 },
      waypoint: nearby,
    },
  ]);
  expect(searchByText).toHaveBeenCalledWith(
    expect.objectContaining({
      includedType: "bus_station",
      fields: ["id", "displayName", "location"],
    }),
  );
});
