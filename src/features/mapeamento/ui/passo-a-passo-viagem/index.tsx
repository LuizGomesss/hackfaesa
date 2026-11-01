"use client";

import NearMe from "@mui/icons-material/NearMe";
import { type ReactNode, useId } from "react";
import {
  DiagramaFluxoViagem,
  type EtapaViagem,
} from "../diagrama-fluxo-viagem";
import styles from "./passo-a-passo-viagem.module.css";

export interface PassoAPassoViagemProps {
  etapas: EtapaViagem[];
  detalhes?: ReactNode;
  onIniciarNavegacao?: () => void;
}

export function PassoAPassoViagem({
  etapas,
  detalhes,
  onIniciarNavegacao,
}: PassoAPassoViagemProps) {
  const tituloId = useId();

  return (
    <section className={styles.root} aria-labelledby={tituloId}>
      <div className={styles.handle} aria-hidden="true" />
      <h2 className={styles.title} id={tituloId}>
        Passo a passo da sua rota
      </h2>
      <DiagramaFluxoViagem etapas={etapas} />
      {detalhes}
      <button
        type="button"
        className={styles.startButton}
        onClick={onIniciarNavegacao}
      >
        <NearMe aria-hidden="true" />
        Iniciar navegação
      </button>
    </section>
  );
}
