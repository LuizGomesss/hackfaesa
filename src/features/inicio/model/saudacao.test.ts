import { expect, it } from "vitest";
import { saudacaoPorHora } from "./saudacao";

it.each([
  [4, "Boa noite"],
  [5, "Bom dia"],
  [11, "Bom dia"],
  [12, "Boa tarde"],
  [17, "Boa tarde"],
  [18, "Boa noite"],
  [23, "Boa noite"],
])("às %i horas retorna %s", (hora, saudacao) => {
  expect(saudacaoPorHora(hora)).toBe(saudacao);
});
