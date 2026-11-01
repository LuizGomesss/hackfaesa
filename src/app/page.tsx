"use client";

import { useRouter } from "next/navigation";
import { InicioPage } from "@/features/inicio";

export default function Home() {
  const router = useRouter();
  return <InicioPage onPlanejarViagem={() => router.push("/planejar")} />;
}
