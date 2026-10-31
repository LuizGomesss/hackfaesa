import { z } from "zod";

// Área da demo: Grande Vitória. Lista fechada para a simulação ser coerente.
export const LOCAIS = [
  "Terminal de Campo Grande, Cariacica",
  "Terminal de Itacibá, Cariacica",
  "Terminal de Carapina, Serra",
  "Terminal de Laranjeiras, Serra",
  "Terminal de Vila Velha, Vila Velha",
  "Terminal do Ibes, Vila Velha",
  "Terminal de Itaparica, Vila Velha",
  "Terminal de Jardim América, Cariacica",
  "Centro, Vitória",
  "Jardim da Penha, Vitória",
  "Praia do Canto, Vitória",
  "Enseada do Suá, Vitória",
  "Maruípe, Vitória",
  "FAESA Campus Vitória, Vitória",
  "UFES Goiabeiras, Vitória",
  "Praia da Costa, Vila Velha",
  "Glória, Vila Velha",
  "Jacaraípe, Serra",
  "Viana Sede, Viana",
] as const;

const local = z.enum(LOCAIS, { error: "Escolha um local da lista." });
const horario = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido.");

export const viagemSchema = z
  .object({ origem: local, destino: local, horario })
  .refine((viagem) => viagem.origem !== viagem.destino, {
    message: "A origem e o destino precisam ser diferentes.",
    path: ["destino"],
  });
export type Viagem = z.infer<typeof viagemSchema>;

export const pedidoOpcoesSchema = z.object({
  viagem: viagemSchema,
  agoraMin: z.number().int().min(0).max(1439),
});
export type PedidoOpcoes = z.infer<typeof pedidoOpcoesSchema>;

export type NivelLotacao = "baixa" | "media" | "alta" | "critica";
export type TipoOpcao =
  | "primeira"
  | "esperar"
  | "antecipar"
  | "outra-linha"
  | "outro-ponto";

export interface OpcaoEmbarque {
  id: string;
  tipo: TipoOpcao;
  titulo: string;
  linha: string;
  partida: string;
  chegada: string;
  tempoTotalMin: number;
  caminhadaMin: number;
  /** Diferença de chegada em relação à primeira opção; negativa chega antes. */
  diferencaChegadaMin: number;
  lotacaoPct: number;
  nivel: NivelLotacao;
}

export interface RespostaOpcoes {
  recomendada: OpcaoEmbarque;
  motivo: string;
  /** Verdadeiro quando existe opção bem menos lotada que a primeira. */
  temAlternativa: boolean;
  /** Verdadeiro quando o distribuidor desviou da melhor opção, já muito indicada. */
  redistribuida: boolean;
  alternativas: OpcaoEmbarque[];
}

export const escolhaSchema = z.object({ opcaoId: z.string().min(1).max(40) });

export const relatoSchema = z.object({
  linha: z.string().min(1).max(20),
  hora: z.number().int().min(0).max(23),
  embarcou: z.boolean(),
  lotacao: z.enum(["vazio", "em-pe", "cheio", "lotado"]),
});
export type Relato = z.infer<typeof relatoSchema>;

export const ROTULO_LOTACAO: Record<NivelLotacao, string> = {
  baixa: "Com lugares",
  media: "Em pé, com espaço",
  alta: "Cheio",
  critica: "Lotado",
};
