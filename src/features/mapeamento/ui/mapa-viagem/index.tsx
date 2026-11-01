"use client";

import GpsFixed from "@mui/icons-material/GpsFixed";
import MapOutlined from "@mui/icons-material/MapOutlined";
import { useEffect } from "react";
import {
  type LocalViagem,
  type TripSummary,
  useGoogleMap,
} from "@/features/google-maps";
import styles from "./mapa-viagem.module.css";

export interface MapaViagemProps {
  origem?: LocalViagem;
  destino?: LocalViagem;
  onCentralizar?: () => void;
  onTripChange?: (summary: TripSummary | null) => void;
}

export function MapaViagem({
  onCentralizar,
  origem,
  destino,
  onTripChange,
}: MapaViagemProps) {
  const { containerRef, status, error, centralizar, locationStatus, summary } =
    useGoogleMap({
      origem,
      destino,
    });
  useEffect(() => {
    onTripChange?.(summary);
  }, [summary, onTripChange]);

  return (
    <section className={styles.root} aria-label="Mapa da viagem">
      <div ref={containerRef} className={styles.canvas} />

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
      {locationStatus && (
        <output className={styles.locationStatus}>{locationStatus}</output>
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
