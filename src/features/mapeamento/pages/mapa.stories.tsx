import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapaPage } from "./mapa.page";

const meta = {
  title: "Mapeamento/Pages/Mapa",
  component: MapaPage,
  parameters: { layout: "fullscreen" },
  argTypes: {
    onVoltar: { action: "voltar" },
    onInverter: { action: "inverter origem e destino" },
    onIniciarNavegacao: { action: "iniciar navegação" },
  },
} satisfies Meta<typeof MapaPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
