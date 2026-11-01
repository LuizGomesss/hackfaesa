import type { ReactNode } from "react";
import { AvisoDadosSimulados } from "@/shared/ui/aviso-dados-simulados";
import { MolduraApp } from "@/shared/ui/moldura-app";

export default function PassageiroLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MolduraApp>
      <div className="mx-auto grid w-full max-w-md gap-5">
        {children}
        <AvisoDadosSimulados />
      </div>
    </MolduraApp>
  );
}
