import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiagramaFluxoViagem } from ".";

const meta = {
  title: "UI/Diagrama fluxo de viagem",
  component: DiagramaFluxoViagem,
  parameters: { layout: "fullscreen" },
  args: {
    etapas: [
      {
        id: "origem",
        titulo: "Ponto 1",
        descricao: "Embarque",
        horario: "10:45",
        icone: "caminhada",
        cor: "azul",
      },
      {
        id: "terminal-central",
        titulo: "Terminal Central",
        descricao: "Chegada",
        horario: "10:51",
        icone: "onibus",
        cor: "azul",
        linha: "L12",
      },
      {
        id: "terminal-leste",
        titulo: "Terminal Leste",
        descricao: "Chegada",
        horario: "11:28",
        icone: "onibus",
        cor: "verde",
        linha: "L28",
      },
      {
        id: "ponto-2",
        titulo: "Ponto 2",
        descricao: "Embarque",
        icone: "caminhada",
        cor: "laranja",
      },
      {
        id: "destino",
        titulo: "Destino",
        descricao: "Chegada",
        horario: "11:33",
        icone: "destino",
        cor: "vermelho",
      },
    ],
  },
} satisfies Meta<typeof DiagramaFluxoViagem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
