"use client";

import GpsFixed from "@mui/icons-material/GpsFixed";
import MapOutlined from "@mui/icons-material/MapOutlined";
import { useGoogleMap } from "@/features/google-maps";
import styles from "./mapa-viagem.module.css";

export interface MapaViagemProps {
  origem?: string;
  destino?: string;
  onCentralizar?: () => void;
}

export function MapaViagem({
  onCentralizar,
  origem,
  destino,
}: MapaViagemProps) {
  const {
    containerRef,
    status,
    error,
    centralizar,
    locationStatus,
    busStopsStatus,
  } = useGoogleMap({ origem, destino });

  return (
    <section className={styles.root} aria-label="Mapa da viagem">
      <div ref={containerRef} className={styles.canvas} />
      {status === "ready" && (
        <div className={styles.locationStatus}>
          <output>{busStopsStatus}</output>
          {locationStatus && <output>{locationStatus}</output>}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            Pontos: © colaboradores do OpenStreetMap
          </a>
        </div>
      )}

      {status !== "ready" && (
        <div className={styles.placeholder} aria-live="polite">
          <MapOutlined className={styles.mapIcon} aria-hidden="true" />
          <p className={styles.title}>
            {status === "error" ? "Mapa indisponível" : "Carregando mapa"}
          </p>
          <p className={styles.description}>
            {error ?? "Conectando ao Google Maps…"}
          </p>
        </div>
      )}
      <button
        type="button"
        className={styles.centerButton}
        aria-label="Centralizar mapa"
        onClick={() => {
          centralizar();
          onCentralizar?.();
        }}
        disabled={status !== "ready"}
      >
        <GpsFixed aria-hidden="true" />
      </button>
    </section>
  );
}
