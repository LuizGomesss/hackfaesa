import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IndicadorLotacao } from "./indicador-lotacao";

const meta = {
  title: "Embarque/UI/Indicador de lotação",
  component: IndicadorLotacao,
  args: { nivel: "baixa", pct: 40 },
} satisfies Meta<typeof IndicadorLotacao>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComLugares: Story = {};
export const EmPe: Story = { args: { nivel: "media", pct: 70 } };
export const Cheio: Story = { args: { nivel: "alta", pct: 90 } };
export const Lotado: Story = { args: { nivel: "critica", pct: 108 } };
