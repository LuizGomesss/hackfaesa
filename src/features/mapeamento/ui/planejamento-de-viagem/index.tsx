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
  onConfirmar?: (valores: { origem: string; destino: string }) => void;
}

export function PlanejamentoDeViagem({
  origem,
  destino,
  salvo = false,
  onVoltar,
  onSalvar,
  onInverter,
  onConfirmar,
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
      <form
        className={styles.route}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onConfirmar?.({
            origem: String(data.get("origem") ?? "").trim(),
            destino: String(data.get("destino") ?? "").trim(),
          });
        }}
        onBlur={(event) => {
          if (event.target instanceof HTMLInputElement)
            event.currentTarget.requestSubmit();
        }}
      >
        <div className={styles.connector} aria-hidden="true" />
        <div className={styles.field}>
          <span className={styles.originMarker} aria-hidden="true" />
          <label className={styles.fieldText}>
            <span className={styles.label}>Origem</span>
            <input
              key={origem}
              name="origem"
              defaultValue={origem}
              placeholder="Endereço ou CEP de origem"
              className={styles.input}
              enterKeyHint="search"
            />
          </label>
        </div>
        <div className={styles.field}>
          <span className={styles.destinationMarker} aria-hidden="true">
            <span />
          </span>
          <label className={styles.fieldText}>
            <span className={styles.label}>Destino</span>
            <input
              key={destino}
              name="destino"
              defaultValue={destino}
              placeholder="Endereço ou CEP de destino"
              className={styles.input}
              enterKeyHint="search"
            />
          </label>
        </div>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.swap}`}
          aria-label="Inverter origem e destino"
          onClick={onInverter}
        >
          <SwapVert aria-hidden="true" />
        </button>
        <button type="submit" className={styles.hiddenSubmit} tabIndex={-1}>
          Localizar no mapa
        </button>
      </form>
    </section>
  );
}
