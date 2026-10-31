import { afterEach, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

afterEach(() => {
  vi.useRealTimers();
});

it("waits for map movement to settle and cancels work on disposal", () => {
  vi.useFakeTimers();
  const callback = vi.fn();
  const schedule = debounce(callback, 800);
  schedule();
  vi.advanceTimersByTime(500);
  schedule();
  vi.advanceTimersByTime(799);
  expect(callback).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(callback).toHaveBeenCalledTimes(1);
  schedule();
  schedule.cancel();
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
});
