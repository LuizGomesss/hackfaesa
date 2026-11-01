import { fonteBuzu, IconeBuzu, MarcaBuzu } from "@/shared/marca";
import styles from "./abertura.module.css";

export interface AberturaPageProps {
  versao?: string;
  saindo?: boolean;
}

export function AberturaPage({
  versao = "1.0",
  saindo = false,
}: AberturaPageProps) {
  return (
    <section
      className={`${fonteBuzu.className} ${styles.root} ${saindo ? styles.saindo : ""}`}
      aria-label="Abrindo o Buzu"
      aria-busy="true"
    >
      <IconeBuzu className={styles.icone} />
      <MarcaBuzu className={styles.marca} />
      <p className={styles.slogan}>Seu ônibus na palma da mão</p>
      <div className={styles.carregando} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className={styles.versao}>versão {versao}</p>
    </section>
  );
}
