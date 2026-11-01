import { Inter } from "next/font/google";
import styles from "./marca.module.css";

export const fonteBuzu = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

// O tamanho vem do font-size definido por quem usa a marca; as proporções são em em.
export function IconeBuzu({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.icone} ${className}`} aria-hidden="true">
      <span className={styles.iconeLetra}>b</span>
      <span className={styles.iconePonto} />
    </div>
  );
}

export function MarcaBuzu({ className = "" }: { className?: string }) {
  return (
    <p className={`${styles.marca} ${className}`}>
      buzu
      <span className={styles.marcaPonto} aria-hidden="true" />
    </p>
  );
}
