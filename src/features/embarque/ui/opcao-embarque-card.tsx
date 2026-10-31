import { Clock, Footprints } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { OpcaoEmbarque } from "../model";
import { IndicadorLotacao } from "./indicador-lotacao";

export function OpcaoEmbarqueCard({
  opcao,
  onEscolher,
}: {
  opcao: OpcaoEmbarque;
  onEscolher: (opcao: OpcaoEmbarque) => void;
}) {
  return (
    <Card className="grid gap-3">
      <h3 className="font-semibold">{opcao.titulo}</h3>
      <IndicadorLotacao nivel={opcao.nivel} pct={opcao.lotacaoPct} />
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-4" aria-hidden="true" />
          Sai {opcao.partida}, chega {opcao.chegada}
        </span>
        <span className="inline-flex items-center gap-1">
          <Footprints className="size-4" aria-hidden="true" />
          {opcao.caminhadaMin} min a pé
        </span>
      </p>
      <Button variant="outline" onClick={() => onEscolher(opcao)}>
        Escolher<span className="sr-only">: {opcao.titulo}</span>
      </Button>
    </Card>
  );
}
