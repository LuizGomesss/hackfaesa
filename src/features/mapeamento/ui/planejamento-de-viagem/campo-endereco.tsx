"use client";

import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import { type ReactNode, useId, useRef, useState } from "react";
import {
  type LocalViagem,
  type PlaceSuggestion,
  usePlaceSuggestions,
} from "@/features/google-maps";
import styles from "./planejamento-de-viagem.module.css";

export interface CampoEnderecoProps {
  name: string;
  label: string;
  placeholder: string;
  valor: string;
  marcador: ReactNode;
  onConfirmar: (local: LocalViagem) => void;
}

export function CampoEndereco({
  name,
  label,
  placeholder,
  valor,
  marcador,
  onConfirmar,
}: CampoEnderecoProps) {
  const [texto, setTexto] = useState(valor);
  const [valorAnterior, setValorAnterior] = useState(valor);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const selecionando = useRef(false);
  const listaId = useId();
  const { suggestions, status, search, clear, select } = usePlaceSuggestions();

  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    setTexto(valor);
  }

  const mostrarLista = aberto && suggestions.length > 0;
  const aviso = !aberto
    ? ""
    : status === "error"
      ? "Não foi possível buscar sugestões."
      : status === "loading" && !suggestions.length
        ? "Buscando endereços…"
        : status === "ready" && !suggestions.length
          ? "Nenhum endereço encontrado."
          : "";

  function fechar() {
    setAberto(false);
    setAtivo(-1);
    clear();
  }

  function confirmarTexto() {
    fechar();
    const confirmado = texto.trim();
    if (confirmado !== valor) onConfirmar({ texto: confirmado });
  }

  async function escolher(sugestao: PlaceSuggestion) {
    selecionando.current = true;
    setTexto(sugestao.texto);
    setAberto(false);
    setAtivo(-1);
    try {
      onConfirmar(await select(sugestao));
    } finally {
      selecionando.current = false;
    }
  }

  return (
    <div className={styles.fieldWrap}>
      <div className={styles.field}>
        {marcador}
        <label className={styles.fieldText}>
          <span className={styles.label}>{label}</span>
          <input
            name={name}
            value={texto}
            placeholder={placeholder}
            className={styles.input}
            enterKeyHint="search"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={mostrarLista}
            aria-controls={listaId}
            aria-activedescendant={
              mostrarLista && ativo >= 0 ? `${listaId}-${ativo}` : undefined
            }
            onChange={(event) => {
              const novo = event.target.value;
              setTexto(novo);
              setAberto(true);
              setAtivo(-1);
              search(novo);
              if (!novo.trim() && valor) onConfirmar({ texto: "" });
            }}
            onBlur={() => {
              if (!selecionando.current) confirmarTexto();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (mostrarLista && ativo >= 0)
                  void escolher(suggestions[ativo]);
                else confirmarTexto();
              } else if (event.key === "Escape") {
                fechar();
              } else if (
                mostrarLista &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
              ) {
                event.preventDefault();
                const passo = event.key === "ArrowDown" ? 1 : -1;
                setAtivo(
                  (atual) =>
                    (Math.max(atual, passo > 0 ? -1 : 0) +
                      passo +
                      suggestions.length) %
                    suggestions.length,
                );
              }
            }}
          />
        </label>
      </div>
      {/* preventDefault mantém o foco no campo ao tocar em uma sugestão. */}
      <div
        id={listaId}
        role="listbox"
        aria-label={`Sugestões de ${label.toLowerCase()}`}
        className={styles.suggestions}
        hidden={!mostrarLista}
        onMouseDown={(event) => event.preventDefault()}
      >
        {suggestions.map((sugestao, index) => (
          <button
            key={sugestao.id}
            type="button"
            id={`${listaId}-${index}`}
            role="option"
            aria-selected={index === ativo}
            tabIndex={-1}
            className={styles.suggestion}
            onClick={() => void escolher(sugestao)}
          >
            <PlaceOutlined aria-hidden="true" />
            <span className={styles.suggestionText}>
              <strong>{sugestao.titulo}</strong>
              {sugestao.detalhe && <span>{sugestao.detalhe}</span>}
            </span>
          </button>
        ))}
      </div>
      {aviso && (
        <p className={styles.suggestionsStatus} aria-live="polite">
          {aviso}
        </p>
      )}
    </div>
  );
}
