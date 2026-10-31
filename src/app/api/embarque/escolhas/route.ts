import { escolhaSchema } from "@/features/embarque/model";
import { registrarEscolha } from "@/features/embarque/server/estado";

export async function POST(request: Request) {
  const escolha = escolhaSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!escolha.success) {
    return Response.json({ erro: "Escolha inválida." }, { status: 400 });
  }
  registrarEscolha(escolha.data.opcaoId);
  return new Response(null, { status: 204 });
}
