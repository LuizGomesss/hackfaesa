import { pedidoOpcoesSchema } from "@/features/embarque/model";
import { indicacoesDe } from "@/features/embarque/server/estado";
import { distribuir, gerarOpcoes } from "@/features/embarque/server/simulacao";

export async function POST(request: Request) {
  const pedido = pedidoOpcoesSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!pedido.success) {
    return Response.json({ erro: "Pedido inválido." }, { status: 400 });
  }
  return Response.json(distribuir(gerarOpcoes(pedido.data), indicacoesDe));
}
