import ArrowForward from "@mui/icons-material/ArrowForward";
import DirectionsBus from "@mui/icons-material/DirectionsBus";
import DirectionsWalk from "@mui/icons-material/DirectionsWalk";
import LocationOn from "@mui/icons-material/LocationOn";
import styles from "./diagrama-fluxo-viagem.module.css";

export interface EtapaViagem {
  id: string;
  titulo: string;
  descricao: string;
  horario?: string;
  icone: "caminhada" | "onibus" | "destino";
  cor: "azul" | "verde" | "laranja" | "vermelho";
  linha?: string;
}

export interface DiagramaFluxoViagemProps {
  etapas: EtapaViagem[];
}

const icones = {
  caminhada: DirectionsWalk,
  onibus: DirectionsBus,
  destino: LocationOn,
};

export function DiagramaFluxoViagem({ etapas }: DiagramaFluxoViagemProps) {
  return (
    <div className={styles.root}>
      <ol className={styles.flow} aria-label="Etapas da viagem">
        {etapas.map((etapa, index) => {
          const Icone = icones[etapa.icone];
          return (
            <li
              className={`${styles.step} ${styles[etapa.cor]}`}
              key={etapa.id}
            >
              <span className={styles.marker}>
                <Icone className={styles.icon} aria-hidden="true" />
              </span>
              <strong className={styles.title}>{etapa.titulo}</strong>
              <span className={styles.description}>{etapa.descricao}</span>
              {etapa.horario ? (
                <time className={styles.time} dateTime={etapa.horario}>
                  {etapa.horario}
                </time>
              ) : (
                <span className={styles.time} title="Horário não informado">
                  —
                </span>
              )}
              {etapa.linha && (
                <span className={styles.line}>{etapa.linha}</span>
              )}
              {index < etapas.length - 1 && (
                <ArrowForward className={styles.arrow} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
