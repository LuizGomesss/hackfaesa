import DirectionsBus from "@mui/icons-material/DirectionsBus";
import Schedule from "@mui/icons-material/Schedule";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import styles from "./informacoes-basicas-viagem.module.css";

export interface InformacoesBasicasViagemProps {
  tempoEstimado: number | null;
  trocas: number | null;
  linhas: { codigo: string; cor: "azul" | "verde" }[];
}

export function InformacoesBasicasViagem({
  tempoEstimado,
  trocas,
  linhas,
}: InformacoesBasicasViagemProps) {
  const minutos =
    tempoEstimado != null &&
    Number.isFinite(tempoEstimado) &&
    tempoEstimado >= 0
      ? Math.ceil(tempoEstimado)
      : null;
  const horas = minutos != null ? Math.floor(minutos / 60) : 0;
  const restante = minutos != null ? minutos % 60 : 0;
  const duracao =
    minutos == null
      ? "—"
      : horas === 0
        ? `${minutos}min`
        : restante === 0
          ? `${horas}h`
          : `${horas}h${restante}min`;
  const cor =
    minutos == null
      ? undefined
      : minutos < 60
        ? styles.tempoVerde
        : minutos <= 120
          ? styles.tempoAmarelo
          : styles.tempoVermelho;
  return (
    <dl className={styles.root} aria-label="Informações básicas da viagem">
      <div className={`${styles.card} ${cor ?? ""}`}>
        <Schedule className={styles.icon} aria-hidden="true" />
        <div className={styles.content}>
          <dt>Tempo estimado</dt>
          <dd>{duracao}</dd>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.transferIcon}>
          <SwapHoriz className={styles.icon} aria-hidden="true" />
        </span>
        <div className={styles.content}>
          <dt>Trocas</dt>
          <dd>{trocas ?? "—"}</dd>
        </div>
      </div>
      <div className={styles.card}>
        <DirectionsBus
          className={`${styles.icon} ${styles.busIcon}`}
          aria-hidden="true"
        />
        <div className={styles.content}>
          <dt>Linhas</dt>
          <dd className={styles.lines}>
            {linhas.map((linha) => (
              <span
                key={linha.codigo}
                className={`${styles.pill} ${styles[linha.cor]}`}
              >
                {linha.codigo}
              </span>
            ))}
          </dd>
        </div>
      </div>
    </dl>
  );
}
