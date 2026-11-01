import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { PlanejamentoDeViagem } from ".";

const meta = {
  title: "Mapeamento/UI/Planejamento de viagem",
  component: PlanejamentoDeViagem,
  parameters: { layout: "fullscreen" },
  args: {
    origem: "Ponto 1 – Av. Central, 100",
    destino: "Destino – Universidade GV",
    salvo: false,
  },
  argTypes: {
    onVoltar: { action: "voltar" },
    onSalvar: { action: "salvar" },
    onInverter: { action: "inverter" },
    onConfirmar: { action: "localizar endereços" },
  },
} satisfies Meta<typeof PlanejamentoDeViagem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Salvo: Story = { args: { salvo: true } };
export const Interativo: Story = {
  render: function Interativo(args) {
    const [origem, setOrigem] = useState(args.origem);
    const [destino, setDestino] = useState(args.destino);
    const [salvo, setSalvo] = useState(args.salvo);
    return (
      <PlanejamentoDeViagem
        {...args}
        origem={origem}
        destino={destino}
        salvo={salvo}
        onConfirmar={(valores) => {
          if (valores.origem) setOrigem(valores.origem.texto);
          if (valores.destino) setDestino(valores.destino.texto);
          args.onConfirmar?.(valores);
        }}
        onSalvar={() => {
          setSalvo(!salvo);
          args.onSalvar?.();
        }}
        onInverter={() => {
          setOrigem(destino);
          setDestino(origem);
          args.onInverter?.();
        }}
      />
    );
  },
};
