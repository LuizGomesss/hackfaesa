import { useMutation, useQuery } from "@tanstack/react-query";
import type { Relato, RespostaOpcoes, Viagem } from "./model";

async function enviar<T>(url: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (!resposta.ok) throw new Error(`Falha em ${url}: ${resposta.status}`);
  return resposta.status === 204 ? (undefined as T) : resposta.json();
}

export function useOpcoesEmbarque(viagem: Viagem | null) {
  return useQuery({
    queryKey: ["opcoes-embarque", viagem],
    enabled: Boolean(viagem),
    queryFn: () => {
      const agora = new Date();
      return enviar<RespostaOpcoes | null>("/api/embarque/opcoes", {
        viagem,
        agoraMin: agora.getHours() * 60 + agora.getMinutes(),
      });
    },
  });
}

export function useRegistrarEscolha() {
  return useMutation({
    mutationFn: (opcaoId: string) =>
      enviar<void>("/api/embarque/escolhas", { opcaoId }),
  });
}

export function useEnviarRelato() {
  return useMutation({
    mutationFn: (relato: Relato) => enviar<void>("/api/relatos", relato),
  });
}
