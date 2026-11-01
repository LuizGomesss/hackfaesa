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
  return (
    <details className={styles.details}>
      <summary>Horários e detalhes da viagem</summary>
      <p>
        Saída em{" "}
        {new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(trip.timing.startTime ?? ""))}
        . {trip.transfers} {trip.transfers === 1 ? "troca" : "trocas"}. Os
        horários dependem dos dados fornecidos pelas operadoras ao Google Maps.
      </p>
      {trip.timing.missedConnection && (
        <p aria-live="polite">
          Uma das partidas ocorre antes da chegada prevista ao embarque.
          Recalcule a rota para consultar outra conexão.
        </p>
      )}
      {trip.rides.map((ride, index) => {
        const data = [
          ["Linha", ride.lineName || ride.line],
          ["Sentido", ride.headsign],
          [
            "Embarque",
            `${ride.boarding} · ${formatTripTime(ride.boardingTime) || "Horário não informado"}`,
          ],
          [
            "Desembarque",
            `${ride.alighting} · ${formatTripTime(ride.alightingTime) || "Horário não informado"}`,
          ],
          [
            index ? "Caminhada na conexão" : "Caminhada inicial",
            walkDescription(ride.walkBefore),
          ],
          [
            "Espera",
            ride.waitingMinutes != null ? `${ride.waitingMinutes} min` : null,
          ],
          [
            "Tempo no ônibus",
            ride.busMinutes != null ? `${ride.busMinutes} min` : null,
          ],
          [
            "Distância no ônibus",
            ride.busMeters != null
              ? `${(ride.busMeters / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`
              : null,
          ],
          ["Paradas", ride.stopCount != null ? String(ride.stopCount) : null],
          [
            "Frequência",
            ride.frequencyMinutes != null
              ? `A cada ${ride.frequencyMinutes} min`
              : null,
          ],
          ["Identificação da viagem", ride.tripNumber],
        ].filter(([, value]) => value != null && value !== "");
        return (
          <section key={`${index}-${ride.line}`}>
            <h3>
              {index + 1}º ônibus · {ride.line}
            </h3>
            <dl>
              {data.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {ride.lineUrl && (
              <p>
                <a href={ride.lineUrl} target="_blank" rel="noreferrer">
                  Informações da linha
                </a>
              </p>
            )}
            {ride.agencies.map((agency) => (
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
          </section>
        );
      })}
      <p>
        Caminhada final: {walkDescription(trip.lastWalk) || "Não informada"}
      </p>
      <p>
        {trip.fare ? `Tarifa da viagem: ${trip.fare}` : "Tarifa não informada."}
      </p>
      {trip.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </details>
  );
}
