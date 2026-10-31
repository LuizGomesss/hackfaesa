import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapaViagem } from ".";

const meta = {
  title: "UI/Mapa da viagem",
  component: MapaViagem,
  parameters: { layout: "fullscreen" },
  argTypes: { onCentralizar: { action: "centralizar mapa" } },
} satisfies Meta<typeof MapaViagem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { args: { onCentralizar: undefined } };
