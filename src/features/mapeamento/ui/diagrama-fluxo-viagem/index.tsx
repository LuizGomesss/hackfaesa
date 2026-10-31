import { Bus, Footprints, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface EtapaViagem {
  id: string;
  titulo: string;
  descricao: string;
  horario?: string;
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
  vermelho: "bg-accent text-accent-foreground",
};

export function DiagramaFluxoViagem({ etapas }: DiagramaFluxoViagemProps) {
  return (
    <ol aria-label="Etapas da viagem">
      {etapas.map((etapa, index) => {
        const Icone = icones[etapa.icone];
        return (
          <li className="relative flex gap-3 pb-4 last:pb-0" key={etapa.id}>
            {index < etapas.length - 1 && (
              <span
                className="absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 bg-border"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                cores[etapa.cor],
              )}
            >
              <Icone className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{etapa.titulo}</p>
              <p className="text-sm text-muted-foreground">
                {etapa.descricao}
                {etapa.linha && ` · linha ${etapa.linha}`}
              </p>
            </div>
            {etapa.horario && (
              <time className="font-semibold" dateTime={etapa.horario}>
                {etapa.horario}
              </time>
            )}
          </li>
        );
      })}
    </ol>
  );
}
