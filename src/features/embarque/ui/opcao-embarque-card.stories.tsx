import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OpcaoEmbarqueCard } from "./opcao-embarque-card";

const meta = {
  title: "Embarque/UI/Card de opção de embarque",
  component: OpcaoEmbarqueCard,
  argTypes: { onEscolher: { action: "escolher" } },
  args: {
    opcao: {
      id: "S-362-07:18",
      tipo: "esperar",
      titulo: "Espere 12 min e pegue a linha S-362",
      linha: "S-362",
      partida: "07:18",
      chegada: "08:06",
      tempoTotalMin: 50,
      caminhadaMin: 2,
      diferencaChegadaMin: 5,
      lotacaoPct: 62,
      nivel: "media",
    },
    onEscolher: () => {},
  },
} satisfies Meta<typeof OpcaoEmbarqueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
