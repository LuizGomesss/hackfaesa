import { FlaskConical } from "lucide-react";

export function AvisoDadosSimulados() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-accent bg-card px-3 py-2 text-sm text-foreground">
      <FlaskConical
        className="mt-0.5 size-4 shrink-0 text-accent"
        aria-hidden="true"
      />
      <span>
        <strong>Dados simulados.</strong> Linhas, horários e lotação são
        exemplos para esta demonstração, não informações reais do Transcol.
      </span>
    </p>
  );
}
