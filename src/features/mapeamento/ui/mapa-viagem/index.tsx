"use client";

import { LocateFixed, Map as MapIcon } from "lucide-react";
import { useGoogleMap } from "@/features/google-maps";
import { Button } from "@/shared/ui/button";

export interface MapaViagemProps {
  origem?: string;
  destino?: string;
  onCentralizar?: () => void;
}

export function MapaViagem({
  onCentralizar,
  origem,
  destino,
}: MapaViagemProps) {
  const { containerRef, status, error, centralizar, locationStatus } =
    useGoogleMap({ origem, destino });

  return (
    <section
      className="relative h-64 overflow-hidden rounded-xl border border-border bg-secondary"
      aria-label="Mapa da viagem"
    >
      <div ref={containerRef} className="absolute inset-0" />

      {status !== "ready" && (
        <div
          className="absolute inset-0 grid place-content-center justify-items-center gap-1 p-4 text-center"
          aria-live="polite"
        >
          <MapIcon className="size-8 text-primary" aria-hidden="true" />
          <p className="font-semibold">
            {status === "error" ? "Mapa indisponível" : "Carregando mapa"}
          </p>
          <p className="text-sm text-muted-foreground">
            {error ?? "Conectando ao Google Maps…"} O passo a passo abaixo
            continua valendo.
          </p>
        </div>
      )}
      {locationStatus && (
        <p
          className="absolute inset-x-2 bottom-2 rounded-md bg-card p-2 text-sm"
          aria-live="polite"
        >
          {locationStatus}
        </p>
      )}
      {status === "ready" && (
        <Button
          size="icon"
          variant="outline"
          className="absolute top-2 right-2"
          aria-label="Centralizar mapa"
          onClick={() => {
            centralizar();
            onCentralizar?.();
          }}
        >
          <LocateFixed aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}
