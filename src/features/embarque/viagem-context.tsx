"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { OpcaoEmbarque, Viagem } from "./model";

// sessionStorage, e não a URL, para o trajeto não ficar em histórico nem em logs.
const CHAVE = "buzu:viagem";

interface EstadoViagem {
  viagem: Viagem | null;
  escolha: OpcaoEmbarque | null;
}

const VAZIO: EstadoViagem = { viagem: null, escolha: null };

const ViagemContext = createContext<
  | (EstadoViagem & {
      carregado: boolean;
      definirViagem: (viagem: Viagem) => void;
      definirEscolha: (escolha: OpcaoEmbarque) => void;
      encerrar: () => void;
    })
  | null
>(null);

export function ViagemProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoViagem>(VAZIO);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem(CHAVE);
      if (salvo) setEstado(JSON.parse(salvo));
    } catch {
      // Sem storage o fluxo segue funcionando só em memória.
    }
    setCarregado(true);
  }, []);

  const persistir = useCallback((novo: EstadoViagem) => {
    setEstado(novo);
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      // Idem: a persistência é só conveniência.
    }
  }, []);

  const valor = useMemo(
    () => ({
      ...estado,
      carregado,
      definirViagem: (viagem: Viagem) => persistir({ viagem, escolha: null }),
      definirEscolha: (escolha: OpcaoEmbarque) =>
        persistir({ viagem: estado.viagem, escolha }),
      encerrar: () => persistir(VAZIO),
    }),
    [estado, carregado, persistir],
  );

  return (
    <ViagemContext.Provider value={valor}>{children}</ViagemContext.Provider>
  );
}

export function useViagem() {
  const contexto = useContext(ViagemContext);
  if (!contexto) throw new Error("useViagem exige ViagemProvider.");
  return contexto;
}
