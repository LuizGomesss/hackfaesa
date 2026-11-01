"use client";

import { Navigation } from "lucide-react";
import { useId } from "react";
import { Button } from "@/shared/ui/button";
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
    <section
      className="relative -mt-5 grid gap-3 rounded-t-3xl bg-card px-4 pt-2.5 pb-4 shadow-[0_-6px_18px_#1a2b4014]"
      aria-labelledby={tituloId}
    >
      <span
        className="mx-auto h-1.5 w-11 rounded-full bg-border"
        aria-hidden="true"
      />
      <h2 className="text-lg font-bold" id={tituloId}>
        Passo a passo da sua rota
      </h2>
      <DiagramaFluxoViagem etapas={etapas} />
      <Button className="w-full" onClick={onIniciarNavegacao}>
        <Navigation aria-hidden="true" />
        Estou indo
      </Button>
    </section>
  );
}
