"use client";

import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import NearMeOutlined from "@mui/icons-material/NearMeOutlined";
import OndemandVideoOutlined from "@mui/icons-material/OndemandVideoOutlined";
import Wifi from "@mui/icons-material/Wifi";
import { useEffect, useState } from "react";
import { fonteBuzu, IconeBuzu, MarcaBuzu } from "@/shared/marca";
import { saudacaoPorHora } from "../model/saudacao";
import styles from "./inicio.module.css";

export interface InicioPageProps {
  saudacao?: string;
  onPlanejarViagem?: () => void;
  onRecarga?: () => void;
  onWifi?: () => void;
  onEntretenimento?: () => void;
}

export function InicioPage({
  saudacao,
  onPlanejarViagem,
  onRecarga,
  onWifi,
  onEntretenimento,
}: InicioPageProps) {
  // A página é pré-renderizada: a hora só pode ser lida no navegador.
  const [saudacaoAtual, setSaudacaoAtual] = useState("");
  useEffect(() => {
    setSaudacaoAtual(saudacaoPorHora(new Date().getHours()));
  }, []);

  const servicos = [
    {
      titulo: "Planejar viagem",
      descricao: "Rotas e horários",
      icone: <NearMeOutlined aria-hidden="true" />,
      cor: styles.azul,
      onClick: onPlanejarViagem,
    },
    {
      titulo: "Recarga",
      descricao: "Cartão de passagem",
      icone: <CreditCardOutlined aria-hidden="true" />,
      cor: styles.roxo,
      onClick: onRecarga,
    },
    {
      titulo: "Wi-Fi a bordo",
      descricao: "Conecte-se grátis",
      icone: <Wifi aria-hidden="true" />,
      cor: styles.rosa,
      onClick: onWifi,
    },
    {
      titulo: "Entretenimento",
      descricao: "Vídeos a bordo",
      icone: <OndemandVideoOutlined aria-hidden="true" />,
      cor: styles.laranja,
      onClick: onEntretenimento,
    },
  ];

  return (
    <main className={`${fonteBuzu.className} ${styles.root}`}>
      <header className={styles.header}>
        <IconeBuzu className={styles.icone} />
        <div>
          <p className={styles.saudacao}>{saudacao ?? saudacaoAtual}</p>
          <MarcaBuzu className={styles.marca} />
        </div>
      </header>
      <h1 className={styles.titulo}>
        Para onde vamos
        <br />
        hoje?
      </h1>
      <p className={styles.subtitulo}>Escolha um serviço para começar.</p>
      <nav className={styles.servicos} aria-label="Serviços">
        {servicos.map((servico) => (
          <button
            key={servico.titulo}
            type="button"
            className={styles.card}
            onClick={servico.onClick}
          >
            <span className={`${styles.cardIcone} ${servico.cor}`}>
              {servico.icone}
            </span>
            <span className={styles.cardTitulo}>{servico.titulo}</span>
            <span className={styles.cardDescricao}>{servico.descricao}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
