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
        ...trip.rides.flatMap((ride, index): EtapaViagem[] => [
          {
            id: `embarque-${index}`,
            titulo: ride.boarding,
            descricao: [
              index ? "Baldeação" : "Embarque",
              index && ride.walkBefore.minutes
                ? walkDescription(ride.walkBefore)
                : null,
              ride.waitingMinutes != null
                ? `${ride.waitingMinutes} min de espera`
                : null,
            ]
              .filter(Boolean)
              .join(" · "),
            horario: formatTripTime(ride.boardingTime),
            dataHora: ride.boardingTime,
            icone: "onibus",
            cor: index % 2 ? "azul" : "verde",
            linha: ride.line,
          },
          ...(index === trip.rides.length - 1
            ? [
                {
                  id: `desembarque-${index}`,
                  titulo: ride.alighting,
                  descricao: `Desembarque · ${walkDescription(trip.lastWalk) || "Caminhe até o destino"}`,
                  horario: formatTripTime(ride.alightingTime),
                  dataHora: ride.alightingTime,
                  icone: "caminhada" as const,
                  cor: "laranja" as const,
                },
              ]
            : []),
        ]),
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
            trocas={trip?.transfers ?? null}
            linhas={
              trip
                ? trip.lines.map((codigo) => ({
                    codigo,
                    cor: "verde" as const,
                  }))
                : []
            }
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
