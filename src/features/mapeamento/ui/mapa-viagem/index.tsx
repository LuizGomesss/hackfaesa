"use client";

import GpsFixed from "@mui/icons-material/GpsFixed";
import MapOutlined from "@mui/icons-material/MapOutlined";
import styles from "./mapa-viagem.module.css";

export interface MapaViagemProps {
  onCentralizar?: () => void;
}

export function MapaViagem({ onCentralizar }: MapaViagemProps) {
  return (
    <section className={styles.root} aria-label="Mapa da viagem">
      <div className={styles.placeholder}>
        <MapOutlined className={styles.mapIcon} aria-hidden="true" />
        <p className={styles.title}>Mapa da rota</p>
        <p className={styles.description}>O mapa estará disponível em breve.</p>
      </div>
      <button
        type="button"
        className={styles.centerButton}
        aria-label="Centralizar mapa"
        onClick={onCentralizar}
        disabled={!onCentralizar}
      >
        <GpsFixed aria-hidden="true" />
      </button>
    </section>
  );
}
