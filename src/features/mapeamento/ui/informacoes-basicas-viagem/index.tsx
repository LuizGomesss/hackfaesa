import { ArrowLeftRight, Bus, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface InformacoesBasicasViagemProps {
  tempoEstimado: string;
  trocas: number;
  linhas: { codigo: string; cor: "azul" | "verde" }[];
}

function Item({
  icone,
  titulo,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {icone}
        {titulo}
      </dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  );
}

export function InformacoesBasicasViagem({
  tempoEstimado,
  trocas,
  linhas,
}: InformacoesBasicasViagemProps) {
  return (
    <dl
      className="grid grid-cols-3 gap-2"
      aria-label="Informações básicas da viagem"
    >
      <Item
        icone={<Clock className="size-3.5" aria-hidden="true" />}
        titulo="Tempo"
      >
        {tempoEstimado}
      </Item>
      <Item
        icone={<ArrowLeftRight className="size-3.5" aria-hidden="true" />}
        titulo="Trocas"
      >
        {trocas}
      </Item>
      <Item
        icone={<Bus className="size-3.5" aria-hidden="true" />}
        titulo="Linhas"
      >
        <span className="flex flex-wrap gap-1">
          {linhas.map((linha) => (
            <span
              key={linha.codigo}
              className={cn(
                "rounded-full px-2 text-sm text-primary-foreground",
                linha.cor === "azul" ? "bg-primary" : "bg-(--lotacao-baixa)",
              )}
            >
              {linha.codigo}
            </span>
          ))}
        </span>
      </Item>
    </dl>
  );
}
