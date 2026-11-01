"use client";

import { useRouter } from "next/navigation";
import { MapaPage } from "@/features/mapeamento";

export default function Planejar() {
  const router = useRouter();
  return <MapaPage onVoltar={() => router.push("/")} />;
}
