"use client";

import Bookmark from "@mui/icons-material/Bookmark";
import BookmarkBorder from "@mui/icons-material/BookmarkBorder";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import SwapVert from "@mui/icons-material/SwapVert";
import type { LocalViagem } from "@/features/google-maps";
import { CampoEndereco } from "./campo-endereco";
import styles from "./planejamento-de-viagem.module.css";

export interface PlanejamentoDeViagemProps {
  origem: string;
  destino: string;
  salvo?: boolean;
  onVoltar?: () => void;
  onSalvar?: () => void;
  onInverter?: () => void;
  onConfirmar?: (valores: {
    origem?: LocalViagem;
    destino?: LocalViagem;
  }) => void;
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
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.connector} aria-hidden="true" />
        <CampoEndereco
          name="origem"
          label="Origem"
          placeholder="Endereço ou CEP de origem"
          valor={origem}
          marcador={<span className={styles.originMarker} aria-hidden="true" />}
          onConfirmar={(local) => onConfirmar?.({ origem: local })}
        />
        <CampoEndereco
          name="destino"
          label="Destino"
          placeholder="Para onde você vai?"
          valor={destino}
          marcador={
            <span className={styles.destinationMarker} aria-hidden="true">
              <span />
            </span>
          }
          onConfirmar={(local) => onConfirmar?.({ destino: local })}
        />
        <button
          type="button"
          className={`${styles.iconButton} ${styles.swap}`}
          aria-label="Inverter origem e destino"
          onClick={onInverter}
        >
          <SwapVert aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
