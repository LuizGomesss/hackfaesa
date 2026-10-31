import DirectionsBus from "@mui/icons-material/DirectionsBus";
import Schedule from "@mui/icons-material/Schedule";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import styles from "./informacoes-basicas-viagem.module.css";

export interface InformacoesBasicasViagemProps {
  tempoEstimado: string;
  trocas: number;
  linhas: { codigo: string; cor: "azul" | "verde" }[];
}

export function InformacoesBasicasViagem({
  tempoEstimado,
  trocas,
  linhas,
}: InformacoesBasicasViagemProps) {
  return (
    <dl className={styles.root} aria-label="Informações básicas da viagem">
      <div className={styles.card}>
        <Schedule className={styles.icon} aria-hidden="true" />
        <div className={styles.content}>
          <dt>Tempo estimado</dt>
          <dd>{tempoEstimado}</dd>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.transferIcon}>
          <SwapHoriz className={styles.icon} aria-hidden="true" />
        </span>
        <div className={styles.content}>
          <dt>Trocas</dt>
          <dd>{trocas}</dd>
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
