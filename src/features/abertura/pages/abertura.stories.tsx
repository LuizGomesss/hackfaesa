import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AberturaInicial } from "../ui/abertura-inicial";
import { AberturaPage } from "./abertura.page";

const meta = {
  title: "Abertura/Pages/Abertura",
  component: AberturaPage,
  parameters: { layout: "fullscreen" },
  args: { versao: "1.0", saindo: false },
} satisfies Meta<typeof AberturaPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const TransicaoParaOApp: Story = {
  render: () => (
    <AberturaInicial>
      <p style={{ padding: 24 }}>Conteúdo do aplicativo</p>
    </AberturaInicial>
  ),
};
