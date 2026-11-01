"use client";

import { useState } from "react";
import type { LocalViagem, TripSummary } from "@/features/google-maps";
import type { EtapaViagem } from "../ui/diagrama-fluxo-viagem";
import { InformacoesBasicasViagem } from "../ui/informacoes-basicas-viagem";
import { MapaViagem } from "../ui/mapa-viagem";
import { PassoAPassoViagem } from "../ui/passo-a-passo-viagem";
import { PlanejamentoDeViagem } from "../ui/planejamento-de-viagem";
import {
  DetalhesViagem,
  formatTripTime,
  walkDescription,
} from "./detalhes-viagem";
import styles from "./mapa.module.css";

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
  const [trip, setTrip] = useState<TripSummary | null>(null);
  const etapas: EtapaViagem[] = trip
    ? [
        {
          id: "origem",
          titulo: "Origem",
          descricao:
            walkDescription(trip.firstWalk) || "Caminhe até o embarque",
          horario: formatTripTime(trip.timing.startTime),
          dataHora: trip.timing.startTime,
          icone: "caminhada",
          cor: "azul",
        },
        {
          id: "embarque",
          titulo: trip.boarding,
          descricao:
            trip.timing.waitingMinutes != null
              ? `Embarque · ${trip.timing.waitingMinutes} min de espera`
              : "Embarque",
          horario: formatTripTime(trip.timing.boardingTime),
          dataHora: trip.timing.boardingTime,
          icone: "onibus",
          cor: "verde",
          linha: trip.line,
        },
        {
          id: "desembarque",
          titulo: trip.alighting,
          descricao: `Desembarque · ${walkDescription(trip.lastWalk) || "Caminhe até o destino"}`,
          horario: formatTripTime(trip.timing.alightingTime),
          dataHora: trip.timing.alightingTime,
          icone: "caminhada",
          cor: "laranja",
        },
        {
          id: "destino",
          titulo: "Destino",
          descricao: "Chegada",
          horario: formatTripTime(trip.timing.arrivalTime),
          dataHora: trip.timing.arrivalTime,
          icone: "destino",
          cor: "vermelho",
        },
      ]
    : [];
  const [salvo, setSalvo] = useState(false);
  const [enderecos, setEnderecos] = useState<{
    origem: LocalViagem;
    destino: LocalViagem;
  }>({ origem: { texto: "" }, destino: { texto: "" } });

  return (
    <main className={styles.root}>
      <div className={styles.page}>
        <div className={styles.summary}>
          <PlanejamentoDeViagem
            origem={enderecos.origem.texto}
            destino={enderecos.destino.texto}
            onConfirmar={(valores) =>
              setEnderecos((atual) => ({ ...atual, ...valores }))
            }
            salvo={salvo}
            onSalvar={() => setSalvo(!salvo)}
            onVoltar={onVoltar}
            onInverter={() => {
              setEnderecos((atual) => ({
                origem: atual.destino,
                destino: atual.origem,
              }));
              onInverter?.();
            }}
          />
          <InformacoesBasicasViagem
            tempoEstimado={trip?.minutes ?? null}
            trocas={trip ? 0 : null}
            linhas={trip ? [{ codigo: trip.line, cor: "verde" }] : []}
          />
        </div>
        <MapaViagem
          origem={enderecos.origem}
          destino={enderecos.destino}
          onTripChange={setTrip}
        />
        <div className={styles.steps}>
          <PassoAPassoViagem
            etapas={etapas}
            detalhes={trip ? <DetalhesViagem trip={trip} /> : undefined}
            onIniciarNavegacao={onIniciarNavegacao}
          />
        </div>
      </div>
    </main>
  );
}
