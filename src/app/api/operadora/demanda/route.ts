import { connection } from "next/server";
import { listarRelatos } from "@/features/embarque/server/estado";
import { demandaPorHora } from "@/features/embarque/server/simulacao";

const LINHAS = ["S-120", "S-245", "S-318", "S-162", "S-407"];

export async function GET() {
  await connection();
  const relatos = listarRelatos();

  const porHora = Array.from({ length: 19 }, (_, indice) => {
    const hora = indice + 5;
    const demanda = demandaPorHora(hora);
    return {
      hora,
      // Só há recusa quando a demanda passa da oferta simulada.
      recusas: Math.max(0, Math.round((demanda - 0.55) * 420)),
    };
  });

  const porLinha = LINHAS.map((linha, indice) => ({
    linha,
    recusas: Math.round(610 * 0.74 ** indice),
    ocupacaoPico: 108 - indice * 7,
  }));

  return Response.json({
    porHora,
    porLinha,
    relatos: {
      total: relatos.length,
      naoEmbarcaram: relatos.filter((relato) => !relato.embarcou).length,
      cheios: relatos.filter(
        (relato) => relato.lotacao === "cheio" || relato.lotacao === "lotado",
      ).length,
    },
  });
}
