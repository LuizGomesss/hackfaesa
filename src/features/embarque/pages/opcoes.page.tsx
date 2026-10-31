"use client";

import { ArrowLeft, Lightbulb, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useOpcoesEmbarque, useRegistrarEscolha } from "../api";
import type { OpcaoEmbarque } from "../model";
import { IndicadorLotacao } from "../ui/indicador-lotacao";
import { OpcaoEmbarqueCard } from "../ui/opcao-embarque-card";
import { useViagem } from "../viagem-context";

export function OpcoesPage() {
  const router = useRouter();
  const { viagem, carregado, definirEscolha } = useViagem();
  const opcoes = useOpcoesEmbarque(viagem);
  const registrarEscolha = useRegistrarEscolha();
  const resposta = opcoes.data;

  useEffect(() => {
    if (carregado && !viagem) router.replace("/");
  }, [carregado, viagem, router]);

  function escolher(opcao: OpcaoEmbarque) {
    definirEscolha(opcao);
    // A contagem alimenta o distribuidor, mas não pode travar o passageiro.
    registrarEscolha.mutate(opcao.id);
    router.push("/viagem");
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Voltar e alterar a viagem">
            <ArrowLeft aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Opções de embarque</h1>
      </div>
      {viagem && (
        <p className="text-sm text-muted-foreground">
          {viagem.origem} → {viagem.destino}, por volta das {viagem.horario}
        </p>
      )}

      {(!carregado || opcoes.isPending) && (
        <output className="grid gap-3">
          <span className="sr-only">Buscando opções de embarque…</span>
          <Skeleton className="h-52" />
          <Skeleton className="h-36" />
        </output>
      )}

      {opcoes.isError && (
        <Card className="grid gap-3" role="alert">
          <p>Não conseguimos buscar as opções agora.</p>
          <Button variant="outline" onClick={() => opcoes.refetch()}>
            <RefreshCw aria-hidden="true" />
            Tentar de novo
          </Button>
        </Card>
      )}

      {opcoes.isSuccess && !opcoes.data && (
        <Card className="grid gap-3">
          <p>Não há partidas perto desse horário. Tente outro horário.</p>
          <Button variant="outline" asChild>
            <Link href="/">Alterar horário</Link>
          </Button>
        </Card>
      )}

      {resposta && (
        <>
          <section
            aria-labelledby="titulo-recomendacao"
            className="grid gap-3 rounded-xl border-2 border-primary bg-card p-4"
          >
            <p className="text-sm font-bold text-accent">
              {resposta.temAlternativa
                ? "Nossa recomendação"
                : "Sem alternativa melhor agora"}
            </p>
            <h2 id="titulo-recomendacao" className="text-xl font-bold">
              {resposta.recomendada.titulo}
            </h2>
            <IndicadorLotacao
              nivel={resposta.recomendada.nivel}
              pct={resposta.recomendada.lotacaoPct}
            />
            <p className="text-sm">
              Sai {resposta.recomendada.partida}, chega{" "}
              {resposta.recomendada.chegada}
            </p>
            <p className="flex gap-2 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
              <Lightbulb
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                <strong>Por quê: </strong>
                {resposta.motivo} A lotação é uma estimativa, não uma garantia
                de lugar.
              </span>
            </p>
            <Button onClick={() => escolher(resposta.recomendada)}>
              Seguir esta opção
            </Button>
          </section>

          {resposta.alternativas.length > 0 && (
            <section className="grid gap-3" aria-labelledby="titulo-outras">
              <h2 id="titulo-outras" className="text-lg font-bold">
                Outras opções
              </h2>
              {resposta.alternativas.map((opcao) => (
                <OpcaoEmbarqueCard
                  key={opcao.id}
                  opcao={opcao}
                  onEscolher={escolher}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
