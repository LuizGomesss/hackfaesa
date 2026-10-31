"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AvisoDadosSimulados } from "@/shared/ui/aviso-dados-simulados";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

interface Demanda {
  porHora: { hora: number; recusas: number }[];
  porLinha: { linha: string; recusas: number; ocupacaoPico: number }[];
  relatos: { total: number; naoEmbarcaram: number; cheios: number };
}

async function buscarDemanda(): Promise<Demanda> {
  const resposta = await fetch("/api/operadora/demanda");
  if (!resposta.ok) throw new Error("Falha ao buscar a demanda.");
  return resposta.json();
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="mt-1 text-3xl font-bold">{valor}</p>
    </Card>
  );
}

const hora = (valor: number) => `${String(valor).padStart(2, "0")}h`;

export function PainelOperadoraPage() {
  const demanda = useQuery({
    queryKey: ["operadora-demanda"],
    queryFn: buscarDemanda,
    refetchInterval: 5000,
  });

  const dados = demanda.data;
  const maximo = dados
    ? Math.max(...dados.porHora.map((item) => item.recusas), 1)
    : 1;
  const totalRecusas = dados?.porHora.reduce(
    (total, item) => total + item.recusas,
    0,
  );
  const pico = dados?.porHora.reduce((maior, item) =>
    item.recusas > maior.recusas ? item : maior,
  );

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold">Demanda reprimida</h1>
        <p className="text-muted-foreground">
          Onde e quando passageiros deixam de embarcar, sem colocar fiscal no
          ponto. Somente dados agregados.
        </p>
      </div>
      <AvisoDadosSimulados />

      {demanda.isPending && (
        <output className="grid gap-3">
          <span className="sr-only">Carregando painel…</span>
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </output>
      )}

      {demanda.isError && (
        <Card className="grid gap-3" role="alert">
          <p>Não conseguimos carregar o painel.</p>
          <Button variant="outline" onClick={() => demanda.refetch()}>
            <RefreshCw aria-hidden="true" />
            Tentar de novo
          </Button>
        </Card>
      )}

      {dados && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Indicador
              titulo="Embarques recusados por dia (estimativa)"
              valor={String(totalRecusas)}
            />
            <Indicador
              titulo="Horário mais crítico"
              valor={pico ? hora(pico.hora) : "—"}
            />
            <Indicador
              titulo="Relatos recebidos nesta demonstração"
              valor={String(dados.relatos.total)}
            />
          </div>

          <Card className="grid gap-3">
            <h2 className="text-lg font-bold">Recusas estimadas por horário</h2>
            <ul
              className="flex h-52 items-end gap-0.5 border-b border-border"
              aria-hidden="true"
            >
              {dados.porHora.map((item) => (
                <li
                  key={item.hora}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                  title={`${hora(item.hora)}: ${item.recusas} recusas`}
                >
                  <span
                    className="w-full rounded-t bg-primary group-hover:bg-accent"
                    style={{
                      height: `${(item.recusas / maximo) * 100}%`,
                      minHeight: item.recusas ? 2 : 0,
                    }}
                  />
                </li>
              ))}
            </ul>
            <div
              className="flex justify-between text-xs text-muted-foreground"
              aria-hidden="true"
            >
              <span>{hora(dados.porHora[0].hora)}</span>
              <span>{hora(dados.porHora[dados.porHora.length - 1].hora)}</span>
            </div>
            <details>
              <summary className="min-h-12 cursor-pointer py-3 font-semibold">
                Ver como tabela
              </summary>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th scope="col">Horário</th>
                    <th scope="col">Recusas estimadas</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.porHora.map((item) => (
                    <tr key={item.hora} className="border-t border-border">
                      <th scope="row" className="py-1 font-normal">
                        {hora(item.hora)}
                      </th>
                      <td>{item.recusas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </Card>

          <Card className="grid gap-3 overflow-x-auto">
            <h2 className="text-lg font-bold">Linhas com mais recusas</h2>
            <table className="w-full text-left">
              <thead className="text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="pb-2 font-medium">
                    Linha
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Recusas/dia
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Ocupação no pico
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.porLinha.map((item) => (
                  <tr key={item.linha} className="border-t border-border">
                    <th scope="row" className="py-2 font-semibold">
                      {item.linha}
                    </th>
                    <td className="text-right">{item.recusas}</td>
                    <td className="text-right">{item.ocupacaoPico}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">Relatos dos passageiros</h2>
            <p className="mt-1">
              {dados.relatos.total === 0
                ? "Nenhum relato ainda. Eles aparecem aqui assim que são enviados."
                : `${dados.relatos.cheios} de ${dados.relatos.total} relatos indicam ônibus cheio ou lotado; ${dados.relatos.naoEmbarcaram} pessoa(s) não conseguiram embarcar.`}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
