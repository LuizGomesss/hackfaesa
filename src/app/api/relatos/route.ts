import { relatoSchema } from "@/features/embarque/model";
import { registrarRelato } from "@/features/embarque/server/estado";

export async function POST(request: Request) {
  const relato = relatoSchema.safeParse(await request.json().catch(() => null));
  if (!relato.success) {
    return Response.json({ erro: "Relato inválido." }, { status: 400 });
  }
  registrarRelato(relato.data);
  return new Response(null, { status: 204 });
}
