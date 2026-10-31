"use client";

import Bookmark from "@mui/icons-material/Bookmark";
import BookmarkBorder from "@mui/icons-material/BookmarkBorder";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import SwapVert from "@mui/icons-material/SwapVert";
import styles from "./planejamento-de-viagem.module.css";

export interface PlanejamentoDeViagemProps {
  origem: string;
  destino: string;
  salvo?: boolean;
  onVoltar?: () => void;
  onSalvar?: () => void;
  onInverter?: () => void;
}

export function PlanejamentoDeViagem({
  origem,
  destino,
  salvo = false,
  onVoltar,
  onSalvar,
  onInverter,
}: PlanejamentoDeViagemProps) {
  return (
    <section className={styles.root} aria-label="Planejamento da viagem">
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Voltar"
          onClick={onVoltar}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h1>Planejamento da viagem</h1>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={salvo ? "Remover viagem dos salvos" : "Salvar viagem"}
          aria-pressed={salvo}
          onClick={onSalvar}
        >
          {salvo ? (
            <Bookmark aria-hidden="true" />
          ) : (
            <BookmarkBorder aria-hidden="true" />
          )}
        </button>
      </header>
      <div className={styles.route}>
        <div className={styles.connector} aria-hidden="true" />
        <div className={styles.field}>
          <span className={styles.originMarker} aria-hidden="true" />
          <div className={styles.fieldText}>
            <span className={styles.label}>Origem</span>
            <strong>{origem}</strong>
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.destinationMarker} aria-hidden="true">
            <span />
          </span>
          <div className={styles.fieldText}>
            <span className={styles.label}>Destino</span>
            <strong>{destino}</strong>
          </div>
        </div>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.swap}`}
          aria-label="Inverter origem e destino"
          onClick={onInverter}
        >
          <SwapVert aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
