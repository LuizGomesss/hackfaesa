"use client";

import { Navigation } from "lucide-react";
import { useId } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  DiagramaFluxoViagem,
  type EtapaViagem,
} from "../diagrama-fluxo-viagem";

export interface PassoAPassoViagemProps {
  etapas: EtapaViagem[];
  onIniciarNavegacao?: () => void;
}

export function PassoAPassoViagem({
  etapas,
  onIniciarNavegacao,
}: PassoAPassoViagemProps) {
  const tituloId = useId();

  return (
    <Card>
      <section className="grid gap-4" aria-labelledby={tituloId}>
        <h2 className="text-lg font-bold" id={tituloId}>
          Passo a passo
        </h2>
        <DiagramaFluxoViagem etapas={etapas} />
        <Button className="w-full" onClick={onIniciarNavegacao}>
          <Navigation aria-hidden="true" />
          Estou indo
        </Button>
      </section>
    </Card>
  );
}
