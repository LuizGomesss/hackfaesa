"use client";

import { useState } from "react";
import type { EtapaViagem } from "../ui/diagrama-fluxo-viagem";
import { InformacoesBasicasViagem } from "../ui/informacoes-basicas-viagem";
import { MapaViagem } from "../ui/mapa-viagem";
import { PassoAPassoViagem } from "../ui/passo-a-passo-viagem";
import { PlanejamentoDeViagem } from "../ui/planejamento-de-viagem";
import styles from "./mapa.module.css";

const etapas: EtapaViagem[] = [
  {
    id: "origem",
    titulo: "Ponto 1",
    descricao: "Embarque",
    horario: "10:45",
    icone: "caminhada",
    cor: "azul",
  },
  {
    id: "terminal-central",
    titulo: "Terminal Central",
    descricao: "Chegada",
    horario: "10:51",
    icone: "onibus",
    cor: "azul",
    linha: "L12",
  },
  {
    id: "terminal-leste",
    titulo: "Terminal Leste",
    descricao: "Chegada",
    horario: "11:28",
    icone: "onibus",
    cor: "verde",
    linha: "L28",
  },
  {
    id: "ponto-2",
    titulo: "Ponto 2",
    descricao: "Embarque",
    icone: "caminhada",
    cor: "laranja",
  },
  {
    id: "destino",
    titulo: "Destino",
    descricao: "Chegada",
    horario: "11:33",
    icone: "destino",
    cor: "vermelho",
  },
];

export interface MapaPageProps {
  onVoltar?: () => void;
  onInverter?: () => void;
  onIniciarNavegacao?: () => void;
}

export function MapaPage({
  onVoltar,
  onInverter,
  onIniciarNavegacao,
}: MapaPageProps) {
  const [salvo, setSalvo] = useState(false);

  return (
    <main className={styles.root}>
      <div className={styles.page}>
        <div className={styles.summary}>
          <PlanejamentoDeViagem
            origem="Ponto 1 – Av. Central, 100"
            destino="Destino – Universidade GV"
            salvo={salvo}
            onSalvar={() => setSalvo(!salvo)}
            onVoltar={onVoltar}
            onInverter={onInverter}
          />
          <InformacoesBasicasViagem
            tempoEstimado="48 min"
            trocas={2}
            linhas={[
              { codigo: "L12", cor: "azul" },
              { codigo: "L28", cor: "verde" },
            ]}
          />
        </div>
        <MapaViagem />
        <div className={styles.steps}>
          <PassoAPassoViagem
            etapas={etapas}
            onIniciarNavegacao={onIniciarNavegacao}
          />
        </div>
      </div>
    </main>
  );
}
