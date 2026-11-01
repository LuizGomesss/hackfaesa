import { ArrowRight, Bus, Footprints, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface EtapaViagem {
  id: string;
  titulo: string;
  descricao: string;
  horario?: string;
  duracao?: string;
  icone: "caminhada" | "onibus" | "destino";
  cor: "azul" | "verde" | "laranja" | "vermelho";
  linha?: string;
}

export interface DiagramaFluxoViagemProps {
  etapas: EtapaViagem[];
}

const icones = {
  caminhada: Footprints,
  onibus: Bus,
  destino: MapPin,
};

const cores: Record<EtapaViagem["cor"], string> = {
  azul: "bg-secondary text-primary",
  verde: "bg-(--lotacao-baixa-fundo) text-(--lotacao-baixa)",
  laranja: "bg-(--lotacao-media-fundo) text-(--lotacao-media)",
  vermelho: "bg-(--destino-fundo) text-accent",
};

export function DiagramaFluxoViagem({ etapas }: DiagramaFluxoViagemProps) {
  return (
    <ol className="flex justify-between gap-1" aria-label="Etapas da viagem">
      {etapas.map((etapa, index) => {
        const Icone = icones[etapa.icone];
        return (
          <li
            className="relative min-w-0 flex-1 text-center text-xs text-muted-foreground"
            key={etapa.id}
          >
            <span
              className={cn(
                "mx-auto mb-1 grid size-11 place-items-center rounded-full",
                cores[etapa.cor],
              )}
            >
              <Icone className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm leading-tight font-semibold text-foreground">
              {etapa.titulo}
            </p>
            <p>{etapa.descricao}</p>
            {etapa.horario && (
              <time
                className="block text-sm font-semibold text-foreground"
                dateTime={etapa.horario}
              >
                {etapa.horario}
              </time>
            )}
            {etapa.duracao && (
              <p className="text-sm font-semibold text-foreground">
                {etapa.duracao}
              </p>
            )}
            {etapa.linha && (
              <span className="mt-0.5 inline-block rounded-full bg-primary px-2.5 text-xs font-bold text-primary-foreground">
                {etapa.linha}
              </span>
            )}
            {index < etapas.length - 1 && (
              <ArrowRight
                className="absolute top-3.5 -right-2 size-4"
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
