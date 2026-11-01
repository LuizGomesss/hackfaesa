import { expect, it } from "vitest";
import { terminalIdentity } from "./transfer-terminal";

it("matches platform labels, abbreviations and the terminal's official name", () => {
  const identity = terminalIdentity(
    "Terminal de Jardim América - Plataforma A",
  );
  expect(identity).toBe("jardim america");
  expect(terminalIdentity("T. Jardim América - Plataforma 2")).toBe(identity);
  expect(
    terminalIdentity(
      "Terminal Urbano Euclério de Azevedo Sampaio (Jardim América)",
    ),
  ).toBe(identity);
});

it("does not classify roadside references to a terminal as internal platforms", () => {
  for (const name of [
    "Rodovia BR-262 - Terminal Jardim América",
    "Em frente ao Terminal Jardim América",
    "Terminal Jardim América - lado externo",
    "Acesso Terminal Jardim América",
  ]) {
    expect(terminalIdentity(name)).toBeNull();
  }
});
