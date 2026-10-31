"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { useEnviarRelato } from "../api";
import type { Relato } from "../model";
import { useViagem } from "../viagem-context";

const LOTACOES: { valor: Relato["lotacao"]; rotulo: string }[] = [
  { valor: "vazio", rotulo: "Tinha lugar" },
  { valor: "em-pe", rotulo: "Em pé, com espaço" },
  { valor: "cheio", rotulo: "Cheio" },
  { valor: "lotado", rotulo: "Lotado" },
];

function Opcao({
  selecionada,
  ...props
}: { selecionada: boolean } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={selecionada ? "default" : "outline"}
      aria-pressed={selecionada}
      className={cn("h-auto py-3", selecionada && "ring-2 ring-ring")}
      {...props}
    />
  );
}

export function RelatoPage() {
  const router = useRouter();
  const { escolha, carregado, encerrar } = useViagem();
  const enviarRelato = useEnviarRelato();
  const [embarcou, setEmbarcou] = useState<boolean | null>(null);
  const [lotacao, setLotacao] = useState<Relato["lotacao"] | null>(null);

  useEffect(() => {
    if (carregado && !escolha && !enviarRelato.isSuccess) router.replace("/");
  }, [carregado, escolha, enviarRelato.isSuccess, router]);

  function enviar() {
    if (!escolha || embarcou === null || !lotacao) return;
    enviarRelato.mutate(
      {
        linha: escolha.linha,
        hora: Number(escolha.partida.slice(0, 2)),
        embarcou,
        lotacao,
      },
      // Encerrar impede um segundo relato da mesma viagem.
      { onSuccess: encerrar },
    );
  }

  if (enviarRelato.isSuccess) {
    return (
      <Card
        className="grid justify-items-center gap-3 text-center"
        role="status"
      >
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold">Obrigado!</h1>
        <p>Seu relato anônimo ajuda a melhorar as próximas estimativas.</p>
        <Button asChild className="w-full">
          <Link href="/">Planejar outra viagem</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-xl font-bold">Como foi o embarque?</h1>
        <p className="text-sm text-muted-foreground">
          É opcional e anônimo. Não guardamos seu trajeto.
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-semibold">
          Você conseguiu embarcar
          {escolha && ` na linha ${escolha.linha}`}?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <Opcao
            selecionada={embarcou === true}
            onClick={() => setEmbarcou(true)}
          >
            Sim
          </Opcao>
          <Opcao
            selecionada={embarcou === false}
            onClick={() => setEmbarcou(false)}
          >
            Não
          </Opcao>
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-semibold">Como estava o ônibus?</legend>
        <div className="grid grid-cols-2 gap-2">
          {LOTACOES.map(({ valor, rotulo }) => (
            <Opcao
              key={valor}
              selecionada={lotacao === valor}
              onClick={() => setLotacao(valor)}
            >
              {rotulo}
            </Opcao>
          ))}
        </div>
      </fieldset>

      {enviarRelato.isError && (
        <p role="alert" className="font-medium text-destructive">
          Não conseguimos enviar. Verifique a conexão e tente de novo.
        </p>
      )}

      <div className="grid gap-2">
        <Button
          onClick={enviar}
          disabled={
            embarcou === null || lotacao === null || enviarRelato.isPending
          }
        >
          {enviarRelato.isError && <RefreshCw aria-hidden="true" />}
          {enviarRelato.isPending ? "Enviando…" : "Enviar relato"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            encerrar();
            router.push("/");
          }}
        >
          Agora não
        </Button>
      </div>
    </div>
  );
}
