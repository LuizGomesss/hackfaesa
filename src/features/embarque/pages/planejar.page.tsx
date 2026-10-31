"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { LOCAIS, type Viagem, viagemSchema } from "../model";
import { useViagem } from "../viagem-context";

function horarioAtual() {
  return new Date().toTimeString().slice(0, 5);
}

export function PlanejarPage() {
  const { viagem, carregado } = useViagem();

  // Espera o cliente para ler a viagem salva e o horário atual sem divergir do
  // HTML prerenderizado.
  if (!carregado) return <Skeleton className="h-96" />;
  return <FormularioViagem viagemSalva={viagem} />;
}

function FormularioViagem({ viagemSalva }: { viagemSalva: Viagem | null }) {
  const router = useRouter();
  const { definirViagem } = useViagem();
  const idBase = useId();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Viagem>({
    resolver: zodResolver(viagemSchema),
    defaultValues: viagemSalva ?? {
      origem: "" as Viagem["origem"],
      destino: "" as Viagem["destino"],
      horario: horarioAtual(),
    },
  });

  function inverter() {
    const { origem, destino } = getValues();
    setValue("origem", destino);
    setValue("destino", origem);
  }

  const campos = [
    { nome: "origem", rotulo: "De onde você sai?" },
    { nome: "destino", rotulo: "Para onde você vai?" },
  ] as const;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold">Para onde vamos?</h1>
        <p className="text-muted-foreground">
          Mostramos o embarque com menos lotação esperada, e por quê.
        </p>
      </div>
      <form
        className="grid gap-4"
        noValidate
        onSubmit={handleSubmit((valores) => {
          definirViagem(valores);
          router.push("/opcoes");
        })}
      >
        {campos.map(({ nome, rotulo }) => {
          const id = `${idBase}-${nome}`;
          const erro = errors[nome]?.message;
          return (
            <div className="grid gap-1.5" key={nome}>
              <Label htmlFor={id}>{rotulo}</Label>
              <Input
                id={id}
                list={`${idBase}-locais`}
                autoComplete="off"
                placeholder="Digite e escolha da lista"
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? `${id}-erro` : undefined}
                {...register(nome)}
              />
              {erro && (
                <p
                  id={`${id}-erro`}
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {erro}
                </p>
              )}
            </div>
          );
        })}
        <datalist id={`${idBase}-locais`}>
          {LOCAIS.map((local) => (
            <option key={local} value={local} />
          ))}
        </datalist>
        <Button variant="secondary" onClick={inverter}>
          <ArrowUpDown aria-hidden="true" />
          Inverter origem e destino
        </Button>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idBase}-horario`}>Que horas quer sair?</Label>
          <Input
            id={`${idBase}-horario`}
            type="time"
            aria-invalid={Boolean(errors.horario)}
            {...register("horario")}
          />
          {errors.horario && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.horario.message}
            </p>
          )}
        </div>
        <Button type="submit">
          <Search aria-hidden="true" />
          Ver opções de embarque
        </Button>
      </form>
    </div>
  );
}
