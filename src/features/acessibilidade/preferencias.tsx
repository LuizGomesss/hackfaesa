"use client";

import { useEffect, useState } from "react";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

const CHAVE = "buzu:acessibilidade";

const OPCOES = [
  {
    atributo: "contraste",
    valor: "alto",
    titulo: "Alto contraste",
    descricao: "Fundo branco, texto preto e bordas fortes.",
  },
  {
    atributo: "texto",
    valor: "grande",
    titulo: "Texto maior",
    descricao: "Aumenta em 25% todos os textos.",
  },
  {
    atributo: "movimento",
    valor: "reduzido",
    titulo: "Menos animação",
    descricao: "Desliga transições e efeitos de carregamento.",
  },
] as const;

type Preferencias = Partial<
  Record<(typeof OPCOES)[number]["atributo"], string>
>;

function aplicar(preferencias: Preferencias) {
  for (const { atributo } of OPCOES) {
    const valor = preferencias[atributo];
    if (valor) document.documentElement.dataset[atributo] = valor;
    else delete document.documentElement.dataset[atributo];
  }
}

function ler(): Preferencias {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
  } catch {
    return {};
  }
}

/** Reaplica as preferências salvas em qualquer rota. */
export function AplicarPreferencias() {
  useEffect(() => aplicar(ler()), []);
  return null;
}

export function AcessibilidadePage() {
  const [preferencias, setPreferencias] = useState<Preferencias>({});

  useEffect(() => setPreferencias(ler()), []);

  function alternar(
    atributo: keyof Preferencias,
    valor: string,
    ligado: boolean,
  ) {
    const novas = { ...preferencias, [atributo]: ligado ? valor : undefined };
    setPreferencias(novas);
    aplicar(novas);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novas));
    } catch {
      // Sem storage, a preferência vale até fechar a página.
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-bold">Acessibilidade</h1>
        <p className="text-sm text-muted-foreground">
          As escolhas ficam salvas neste aparelho e valem para todo o app.
        </p>
      </div>
      <ul className="grid gap-3">
        {OPCOES.map(({ atributo, valor, titulo, descricao }) => (
          <li
            key={atributo}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <Label htmlFor={atributo} className="text-base">
                {titulo}
              </Label>
              <p
                id={`${atributo}-descricao`}
                className="text-sm text-muted-foreground"
              >
                {descricao}
              </p>
            </div>
            <Switch
              id={atributo}
              aria-describedby={`${atributo}-descricao`}
              checked={preferencias[atributo] === valor}
              onCheckedChange={(ligado) => alternar(atributo, valor, ligado)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
