"use client";

import {
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  CircleDot,
  FlaskConical,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

function Endereco({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-3 py-2">
      {icone}
      <div className="min-w-0 pr-10">
        <dt className="text-xs text-muted-foreground">{rotulo}</dt>
        <dd className="truncate font-medium">{valor}</dd>
      </div>
    </div>
  );
}

export function ViagemPage() {
  const router = useRouter();
  const { viagem, escolha, carregado, definirViagem } = useViagem();
  const [salva, setSalva] = useState(false);
  const invertendo = useRef(false);

  useEffect(() => {
    if (carregado && !invertendo.current && (!viagem || !escolha)) {
      router.replace("/");
    }
  }, [carregado, viagem, escolha, router]);

  if (!viagem || !escolha) return null;

  function inverter() {
    if (!viagem) return;
    // Inverter muda as partidas, então a escolha atual deixa de valer.
    invertendo.current = true;
    definirViagem({
      ...viagem,
      origem: viagem.destino,
      destino: viagem.origem,
    });
    router.replace("/opcoes");
  }

  const destinoCurto = viagem.destino.split(",")[0];
  const etapas: EtapaViagem[] = [
    {
      id: "caminhada",
      titulo: "Até o ponto",
      descricao: "Caminhada",
      duracao: `${escolha.caminhadaMin} min`,
      icone: "caminhada",
      cor: "azul",
    },
    {
      id: "embarque",
      titulo: "Embarque",
      descricao: "Partida",
      horario: escolha.partida,
      icone: "onibus",
      cor: "verde",
      linha: escolha.linha,
    },
    {
      id: "destino",
      titulo: destinoCurto,
      descricao: "Chegada",
      horario: escolha.chegada,
      icone: "destino",
      cor: "vermelho",
    },
  ];

  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-card"
    >
      <div className="grid gap-2 px-3 pt-2 pb-3">
        <header className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/opcoes" aria-label="Voltar às opções de embarque">
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="flex-1 text-xl font-bold">Planejamento da viagem</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label={salva ? "Remover viagem dos salvos" : "Salvar viagem"}
            aria-pressed={salva}
            onClick={() => setSalva(!salva)}
          >
            {salva ? (
              <BookmarkCheck aria-hidden="true" />
            ) : (
              <Bookmark aria-hidden="true" />
            )}
          </Button>
        </header>

        <div className="relative">
          <dl className="grid gap-1.5">
            <Endereco
              rotulo="Origem"
              valor={viagem.origem}
              icone={
                <CircleDot
                  className="size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
              }
            />
            <Endereco
              rotulo="Destino"
              valor={viagem.destino}
              icone={
                <MapPin
                  className="size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
              }
            />
          </dl>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full border-border shadow-md"
            aria-label="Inverter origem e destino"
            onClick={inverter}
          >
            <ArrowUpDown aria-hidden="true" />
          </Button>
        </div>

        <InformacoesBasicasViagem
          tempoEstimado={`${escolha.tempoTotalMin} min`}
          trocas={0}
          linhas={[{ codigo: escolha.linha, cor: "azul" }]}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <IndicadorLotacao nivel={escolha.nivel} pct={escolha.lotacaoPct} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <FlaskConical className="size-3.5" aria-hidden="true" />
            Dados simulados
          </span>
        </div>
      </div>

      <MapaViagem
        className="h-auto min-h-72 flex-1 rounded-none border-0 pb-5"
        origem={`${viagem.origem}${REGIAO}`}
        destino={`${viagem.destino}${REGIAO}`}
      />

      <PassoAPassoViagem
        etapas={etapas}
        onIniciarNavegacao={() => router.push("/relato")}
      />
    </main>
  );
}
