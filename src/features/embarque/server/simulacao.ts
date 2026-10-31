import type {
  NivelLotacao,
  OpcaoEmbarque,
  PedidoOpcoes,
  RespostaOpcoes,
  TipoOpcao,
  Viagem,
} from "../model";

const JANELA_MIN = 20;
const MINUTOS_DIA = 1440;
const GANHO_MINIMO_LOTACAO = 15;
// Abaixo disso a primeira opção já tem lugar: não há motivo para mudar a rotina.
const LOTACAO_SEM_NECESSIDADE = 55;

function hash(texto: string) {
  let valor = 0;
  for (const letra of texto) valor = (valor * 31 + letra.charCodeAt(0)) >>> 0;
  return valor;
}

export function paraMinutos(horario: string) {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
}

function paraHorario(minutos: number) {
  const total = ((minutos % MINUTOS_DIA) + MINUTOS_DIA) % MINUTOS_DIA;
  const hora = String(Math.floor(total / 60)).padStart(2, "0");
  const minuto = String(total % 60).padStart(2, "0");
  return `${hora}:${minuto}`;
}

// Curva de demanda por hora: picos às 7h e às 18h.
export function demandaPorHora(hora: number) {
  const pico = (centro: number, largura: number) =>
    Math.exp(-((hora - centro) ** 2) / (2 * largura ** 2));
  return 0.25 + 0.75 * Math.max(pico(7, 1.3), pico(18, 1.6));
}

function nivelDe(pct: number): NivelLotacao {
  if (pct < 55) return "baixa";
  if (pct < 80) return "media";
  if (pct < 100) return "alta";
  return "critica";
}

interface Partida {
  linha: string;
  minuto: number;
  duracao: number;
  caminhadaMin: number;
  lotacaoPct: number;
}

function gerarPartidas(viagem: Viagem): Partida[] {
  const centro = paraMinutos(viagem.horario);
  const chave = `${viagem.origem}|${viagem.destino}`;
  const semente = hash(chave);
  const linhas = [0, 1, 2].map((indice) => ({
    codigo: `S-${100 + ((semente >>> (indice * 4)) % 90) + indice * 100}`,
    caminhadaMin: [2, 4, 9][indice],
    duracao: 24 + ((semente >>> (indice * 3)) % 26),
    fatorLinha: [1.08, 0.92, 0.72][indice],
  }));

  const partidas: Partida[] = [];
  for (const linha of linhas) {
    const pico = demandaPorHora(Math.floor(centro / 60)) > 0.7;
    const intervalo = pico ? 8 : 16;
    const deslocamento = hash(linha.codigo) % intervalo;
    for (
      let minuto = centro - JANELA_MIN;
      minuto <= centro + JANELA_MIN;
      minuto++
    ) {
      if ((minuto + deslocamento) % intervalo !== 0) continue;
      const hora = Math.floor((minuto + MINUTOS_DIA) / 60) % 24;
      const ruido = (hash(`${linha.codigo}${minuto}`) % 37) - 18;
      partidas.push({
        linha: linha.codigo,
        minuto,
        duracao: linha.duracao + (pico ? 8 : 0),
        caminhadaMin: linha.caminhadaMin,
        lotacaoPct: Math.min(
          112,
          Math.max(
            12,
            Math.round(demandaPorHora(hora) * 100 * linha.fatorLinha + ruido),
          ),
        ),
      });
    }
  }
  return partidas;
}

function descrever(
  tipo: TipoOpcao,
  partida: Partida,
  primeiroMinuto: number,
  centro: number,
): string {
  const diferenca = Math.abs(partida.minuto - primeiroMinuto);
  const antecedencia = centro - partida.minuto;
  switch (tipo) {
    case "esperar":
      return `Espere ${diferenca} min e pegue a linha ${partida.linha}`;
    case "antecipar":
      return `Saia ${antecedencia} min antes e pegue a linha ${partida.linha}`;
    case "outro-ponto":
      return `Ande ${partida.caminhadaMin} min até outro ponto e pegue a linha ${partida.linha}`;
    case "outra-linha":
      return `Pegue a linha ${partida.linha}`;
    default:
      return `Pegue o próximo da linha ${partida.linha}`;
  }
}

export function gerarOpcoes({ viagem, agoraMin }: PedidoOpcoes) {
  const centro = paraMinutos(viagem.horario);
  const todas = gerarPartidas(viagem);
  const linhaPrincipal = todas[0]?.linha;
  const partidas = todas
    // Partida que já passou hoje não é opção, a menos que a viagem seja futura.
    .filter(
      (partida) =>
        centro < agoraMin || partida.minuto + partida.caminhadaMin >= agoraMin,
    )
    .sort((a, b) => a.minuto - b.minuto);

  const proxima =
    partidas.find(
      (partida) => partida.linha === linhaPrincipal && partida.minuto >= centro,
    ) ?? partidas[0];
  if (!proxima) return [];

  const chegadaBase = proxima.minuto + proxima.duracao;
  return partidas.map((partida): OpcaoEmbarque => {
    let tipo: TipoOpcao = "outra-linha";
    if (partida === proxima) tipo = "primeira";
    else if (partida.minuto < centro) tipo = "antecipar";
    else if (partida.caminhadaMin >= 9) tipo = "outro-ponto";
    else if (partida.linha === proxima.linha) tipo = "esperar";

    const chegada = partida.minuto + partida.duracao;
    return {
      id: `${partida.linha}-${paraHorario(partida.minuto)}`,
      tipo,
      titulo: descrever(tipo, partida, proxima.minuto, centro),
      linha: partida.linha,
      partida: paraHorario(partida.minuto),
      chegada: paraHorario(chegada),
      tempoTotalMin: partida.duracao + partida.caminhadaMin,
      caminhadaMin: partida.caminhadaMin,
      diferencaChegadaMin: chegada - chegadaBase,
      lotacaoPct: partida.lotacaoPct,
      nivel: nivelDe(partida.lotacaoPct),
    };
  });
}

/** Quantas pessoas podem receber a indicação sem que a opção vire a nova lotada. */
export function capacidadeDeIndicacao(opcao: OpcaoEmbarque) {
  return 3 + Math.max(0, Math.floor((85 - opcao.lotacaoPct) / 10));
}

function pontuacao(opcao: OpcaoEmbarque) {
  return Math.abs(opcao.diferencaChegadaMin) + opcao.lotacaoPct * 0.4;
}

/**
 * Coração do projeto: não manda todo mundo para a mesma alternativa. Opção que
 * já atingiu o limite de indicações sai da disputa e a seguinte assume.
 */
export function distribuir(
  opcoes: OpcaoEmbarque[],
  indicacoes: (opcaoId: string) => number,
): RespostaOpcoes | null {
  const primeira = opcoes.find((opcao) => opcao.tipo === "primeira");
  if (!primeira) return null;

  const candidatas = opcoes
    .filter(
      (opcao) =>
        primeira.lotacaoPct >= LOTACAO_SEM_NECESSIDADE &&
        opcao.lotacaoPct <= primeira.lotacaoPct - GANHO_MINIMO_LOTACAO &&
        opcao.diferencaChegadaMin <= JANELA_MIN,
    )
    .sort((a, b) => pontuacao(a) - pontuacao(b));
  const disponiveis = candidatas.filter(
    (opcao) => indicacoes(opcao.id) < capacidadeDeIndicacao(opcao),
  );

  const escolhida = disponiveis[0];
  const recomendada = escolhida ?? primeira;
  const redistribuida = Boolean(escolhida && escolhida !== candidatas[0]);

  return {
    recomendada,
    temAlternativa: Boolean(escolhida),
    redistribuida,
    motivo: escolhida
      ? explicar(escolhida, primeira, redistribuida)
      : "Esta é a opção mais rápida. Agora, nenhuma alternativa próxima deve estar bem menos cheia.",
    alternativas: opcoes
      .filter((opcao) => opcao.id !== recomendada.id)
      .sort((a, b) => pontuacao(a) - pontuacao(b))
      .slice(0, 4),
  };
}

function explicar(
  opcao: OpcaoEmbarque,
  primeira: OpcaoEmbarque,
  redistribuida: boolean,
) {
  const diferenca = opcao.diferencaChegadaMin;
  const chegada =
    diferenca > 0
      ? `você chega ${diferenca} min depois`
      : diferenca < 0
        ? `você chega ${-diferenca} min antes`
        : "você chega no mesmo horário";
  const base = `A estimativa é de ${opcao.lotacaoPct}% de ocupação, contra ${primeira.lotacaoPct}% da primeira opção, e ${chegada}.`;
  return redistribuida
    ? `${base} Indicamos esta porque a melhor opção já foi sugerida a muita gente e poderia lotar.`
    : base;
}
