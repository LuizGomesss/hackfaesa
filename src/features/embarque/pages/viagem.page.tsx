"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  type EtapaViagem,
  InformacoesBasicasViagem,
  MapaViagem,
  PassoAPassoViagem,
} from "@/features/mapeamento";
import { Button } from "@/shared/ui/button";
import { IndicadorLotacao } from "../ui/indicador-lotacao";
import { useViagem } from "../viagem-context";

const REGIAO = ", Grande Vitória, ES";

export function ViagemPage() {
  const router = useRouter();
  const { viagem, escolha, carregado } = useViagem();

  useEffect(() => {
    if (carregado && (!viagem || !escolha)) router.replace("/");
  }, [carregado, viagem, escolha, router]);

  if (!viagem || !escolha) return null;

  const etapas: EtapaViagem[] = [
    {
      id: "caminhada",
      titulo: "Ande até o ponto",
      descricao: `${escolha.caminhadaMin} min a pé desde ${viagem.origem}`,
      icone: "caminhada",
      cor: "azul",
    },
    {
      id: "embarque",
      titulo: "Embarque no ônibus",
      descricao: "Partida estimada",
      horario: escolha.partida,
      icone: "onibus",
      cor: "verde",
      linha: escolha.linha,
    },
    {
      id: "destino",
      titulo: viagem.destino,
      descricao: "Chegada estimada",
      horario: escolha.chegada,
      icone: "destino",
      cor: "vermelho",
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/opcoes" aria-label="Voltar às opções de embarque">
            <ArrowLeft aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Sua viagem</h1>
      </div>
      <IndicadorLotacao nivel={escolha.nivel} pct={escolha.lotacaoPct} />
      <InformacoesBasicasViagem
        tempoEstimado={`${escolha.tempoTotalMin} min`}
        trocas={0}
        linhas={[{ codigo: escolha.linha, cor: "azul" }]}
      />
      <PassoAPassoViagem
        etapas={etapas}
        onIniciarNavegacao={() => router.push("/relato")}
      />
      <MapaViagem
        origem={`${viagem.origem}${REGIAO}`}
        destino={`${viagem.destino}${REGIAO}`}
      />
    </div>
  );
}
