import type { TripSummary } from "@/features/google-maps";
import styles from "./mapa.module.css";

export function formatTripTime(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
export function walkDescription(walk: TripSummary["firstWalk"]) {
  return [
    walk.minutes != null ? `${walk.minutes} min a pé` : null,
    walk.meters != null ? `${Math.round(walk.meters)} m` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
export function DetalhesViagem({ trip }: { trip: TripSummary }) {
  const data = [
    ["Linha", trip.lineName],
    ["Sentido", trip.headsign],
    [
      "Tempo no ônibus",
      trip.busMinutes != null ? `${trip.busMinutes} min` : null,
    ],
    [
      "Distância no ônibus",
      trip.busMeters != null
        ? `${(trip.busMeters / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`
        : null,
    ],
    ["Paradas", trip.stopCount != null ? String(trip.stopCount) : null],
    [
      "Espera no ponto",
      trip.timing.waitingMinutes != null
        ? `${trip.timing.waitingMinutes} min`
        : null,
    ],
    ["Chegada ao embarque", formatTripTime(trip.timing.atStopTime)],
    [
      "Frequência da linha",
      trip.frequencyMinutes != null
        ? `A cada ${trip.frequencyMinutes} min`
        : null,
    ],
    ["Tarifa informada", trip.fare],
    ["Identificação da viagem", trip.tripNumber],
  ].filter(([, value]) => value != null && value !== "");
  return (
    <details className={styles.details}>
      <summary>Horários e detalhes da viagem</summary>
      <p>
        Horários estimados para saída em{" "}
        {new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(trip.timing.startTime ?? ""))}
        . A previsão do ônibus depende dos dados fornecidos pela operadora ao
        Google Maps.
      </p>
      {trip.timing.missedConnection && (
        <p aria-live="polite">
          O embarque informado ocorre antes da sua chegada a pé ao ponto.
          Recalcule a rota para consultar outra partida.
        </p>
      )}
      <dl>
        {data.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {trip.lineUrl && (
        <p>
          <a href={trip.lineUrl} target="_blank" rel="noreferrer">
            Informações da linha
          </a>
        </p>
      )}
      {trip.agencies.map((agency) => (
        <p key={agency.name}>
          {agency.url ? (
            <a href={agency.url} target="_blank" rel="noreferrer">
              {agency.name}
            </a>
          ) : (
            agency.name
          )}
          {agency.phone && ` · ${agency.phone}`}
        </p>
      ))}
      {trip.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
      {!trip.fare && <p>Tarifa não informada.</p>}
    </details>
  );
}
