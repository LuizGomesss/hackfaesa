import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InicioPage } from "./inicio.page";

const meta = {
  title: "Inicio/Pages/Inicio",
  component: InicioPage,
  parameters: { layout: "fullscreen" },
  args: { saudacao: "Boa noite" },
  argTypes: {
    onPlanejarViagem: { action: "planejar viagem" },
    onRecarga: { action: "recarga" },
    onWifi: { action: "wi-fi a bordo" },
    onEntretenimento: { action: "entretenimento" },
  },
} satisfies Meta<typeof InicioPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const BomDia: Story = { args: { saudacao: "Bom dia" } };
