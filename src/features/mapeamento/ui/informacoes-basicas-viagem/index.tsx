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
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card p-2">
      {icone}
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{titulo}</dt>
        <dd className="font-bold">{children}</dd>
      </div>
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
      className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-1.5"
      aria-label="Informações básicas da viagem"
    >
      <Item
        icone={<Clock className="size-5 shrink-0" aria-hidden="true" />}
        titulo="Tempo estimado"
      >
        {tempoEstimado}
      </Item>
      <Item
        icone={
          <ArrowLeftRight className="size-5 shrink-0" aria-hidden="true" />
        }
        titulo="Trocas"
      >
        {trocas}
      </Item>
      <Item
        icone={<Bus className="size-5 shrink-0" aria-hidden="true" />}
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
