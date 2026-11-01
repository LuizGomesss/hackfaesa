import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InformacoesBasicasViagem } from ".";

const meta = {
  title: "Mapeamento/UI/Informações básicas da viagem",
  component: InformacoesBasicasViagem,
  parameters: { layout: "fullscreen" },
  args: {
    tempoEstimado: 48,
    trocas: 2,
    linhas: [
      { codigo: "L12", cor: "azul" },
      { codigo: "L28", cor: "verde" },
    ],
  },
} satisfies Meta<typeof InformacoesBasicasViagem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const SemTrocas: Story = {
  args: {
    tempoEstimado: 20,
    trocas: 0,
    linhas: [{ codigo: "L12", cor: "azul" }],
  },
};
