import type { Relato } from "../model";

// Estado em memória: suficiente para a demo e nunca guarda origem nem destino.
interface EstadoDemo {
  indicacoes: Map<string, number>;
  relatos: Relato[];
}

const global_ = globalThis as typeof globalThis & { __buzu?: EstadoDemo };
global_.__buzu ??= { indicacoes: new Map(), relatos: [] };
const estado = global_.__buzu;

export function indicacoesDe(opcaoId: string) {
  return estado.indicacoes.get(opcaoId) ?? 0;
}

export function registrarEscolha(opcaoId: string) {
  estado.indicacoes.set(opcaoId, indicacoesDe(opcaoId) + 1);
}

export function registrarRelato(relato: Relato) {
  estado.relatos.push(relato);
}

export function listarRelatos(): readonly Relato[] {
  return estado.relatos;
}
