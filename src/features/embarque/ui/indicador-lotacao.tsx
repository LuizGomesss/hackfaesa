import { TriangleAlert, User, Users, UsersRound } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { type NivelLotacao, ROTULO_LOTACAO } from "../model";

const estilos: Record<NivelLotacao, { classe: string; Icone: typeof User }> = {
  baixa: {
    classe: "bg-(--lotacao-baixa-fundo) text-(--lotacao-baixa)",
    Icone: User,
  },
  media: {
    classe: "bg-(--lotacao-media-fundo) text-(--lotacao-media)",
    Icone: UsersRound,
  },
  alta: {
    classe: "bg-(--lotacao-alta-fundo) text-(--lotacao-alta)",
    Icone: Users,
  },
  critica: {
    classe: "bg-(--lotacao-critica-fundo) text-(--lotacao-critica)",
    Icone: TriangleAlert,
  },
};

// Sempre ícone e texto: a lotação nunca depende só da cor.
export function IndicadorLotacao({
  nivel,
  pct,
}: {
  nivel: NivelLotacao;
  pct: number;
}) {
  const { classe, Icone } = estilos[nivel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-0.5 text-sm font-semibold",
        classe,
      )}
    >
      <Icone className="size-4" aria-hidden="true" />
      {ROTULO_LOTACAO[nivel]} · {pct}%
      <span className="sr-only"> de ocupação estimada</span>
    </span>
  );
}
