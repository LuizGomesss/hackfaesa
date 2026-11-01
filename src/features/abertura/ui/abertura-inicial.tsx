"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AberturaPage } from "../pages/abertura.page";

const DURACAO_SAIDA = 300;

export interface AberturaInicialProps {
  children: ReactNode;
  duracao?: number;
}

// O conteúdo já monta por baixo, para o mapa carregar enquanto a abertura aparece.
export function AberturaInicial({
  children,
  duracao = 2000,
}: AberturaInicialProps) {
  const [fase, setFase] = useState<"visivel" | "saindo" | "concluida">(
    "visivel",
  );

  useEffect(() => {
    const saida = setTimeout(() => setFase("saindo"), duracao);
    const fim = setTimeout(() => setFase("concluida"), duracao + DURACAO_SAIDA);
    return () => {
      clearTimeout(saida);
      clearTimeout(fim);
    };
  }, [duracao]);

  return (
    <>
      {fase !== "concluida" && <AberturaPage saindo={fase === "saindo"} />}
      <div inert={fase === "visivel"}>{children}</div>
    </>
  );
}
