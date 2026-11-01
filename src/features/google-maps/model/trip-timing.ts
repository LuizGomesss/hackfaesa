export function tripTiming(
  start: number,
  firstWalk: number | null | undefined,
  lastWalk: number | null | undefined,
  busDuration: number | null | undefined,
  departure?: Date | null,
  arrival?: Date | null,
) {
  const valid = (value: number | null | undefined) =>
    value != null && Number.isFinite(value) && value >= 0 ? value : null;
  const first = valid(firstWalk),
    last = valid(lastWalk),
    duration = valid(busDuration);
  const boarding =
    departure && Number.isFinite(departure.getTime())
      ? departure.getTime()
      : null;
  const alighting =
    arrival && Number.isFinite(arrival.getTime())
      ? arrival.getTime()
      : boarding != null && duration != null
        ? boarding + duration
        : null;
  const atStop = first != null ? start + first : null;
  const missed = boarding != null && atStop != null && boarding < atStop;
  const wait =
    boarding != null && atStop != null && !missed ? boarding - atStop : null;
  const end =
    alighting != null && last != null && !missed ? alighting + last : null;
  const total =
    end != null
      ? end - start
      : first != null && last != null && duration != null && wait != null
        ? first + wait + duration + last
        : null;
  const iso = (time: number | null) =>
    time != null ? new Date(time).toISOString() : undefined;
  return {
    startTime: iso(start),
    atStopTime: iso(atStop),
    boardingTime: iso(boarding),
    alightingTime: iso(alighting),
    arrivalTime: iso(end),
    waitingMinutes: wait != null ? Math.ceil(wait / 60000) : null,
    minutes: total != null && total >= 0 ? Math.ceil(total / 60000) : null,
    missedConnection: missed,
  };
}
