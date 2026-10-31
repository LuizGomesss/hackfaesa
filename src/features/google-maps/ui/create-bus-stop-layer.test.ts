import { afterEach, expect, it, vi } from "vitest";
import { createHtmlMarker } from "@/shared/lib/google-maps/create-html-marker";
import { createBusStopLayer } from "./create-bus-stop-layer";

vi.mock("@/shared/lib/google-maps/create-html-marker", () => ({
  createHtmlMarker: vi.fn(),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("keeps unique markers across updates and disposes all overlays and the info window", () => {
  const close = vi.fn();
  vi.stubGlobal("google", {
    maps: {
      InfoWindow: class {
        close = close;
      },
    },
  });
  vi.stubGlobal("document", {
    createElement: () => ({ style: {}, setAttribute: vi.fn() }),
  });
  const setMap = vi.fn();
  vi.mocked(createHtmlMarker).mockImplementation(
    () => ({ setMap }) as unknown as google.maps.OverlayView,
  );
  const layer = createBusStopLayer({} as google.maps.Map);
  const stop = { id: "a", name: "Ponto A", lat: -20.3, lng: -40.3 };
  layer.add(stop);
  layer.add(stop);
  layer.add({ ...stop, id: "b" });
  expect(createHtmlMarker).toHaveBeenCalledTimes(2);
  expect(setMap).not.toHaveBeenCalled();
  layer.dispose();
  expect(setMap).toHaveBeenCalledTimes(2);
  expect(setMap).toHaveBeenCalledWith(null);
  expect(close).toHaveBeenCalledOnce();
});
