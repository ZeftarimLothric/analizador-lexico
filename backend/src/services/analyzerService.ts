import { randomUUID } from "crypto";
import type { AnalyzeResponse, LexicalError, Token } from "../types/analysis";

const RESERVED_WORDS = new Set([
  "int",
  "float",
  "if",
  "else",
  "while",
  "for",
  "print",
  "true",
  "false",
  "return",
]);

type Rule = {
  type: string;
  regex: RegExp;
};

const RULES: Rule[] = [
  { type: "PALABRA_RESERVADA", regex: /^(int|float|if|else|while|for|print|true|false|return)\b/ },
  { type: "NUMERO_DECIMAL", regex: /^\d+\.\d+/ },
  { type: "NUMERO_ENTERO", regex: /^\d+/ },
  { type: "CADENA", regex: /^"([^"\\]|\\.)*"/ },
  { type: "IDENTIFICADOR", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: "OP_LOGICO", regex: /^(\&\&|\|\|)/ },
  { type: "OP_RELACIONAL", regex: /^(==|!=|>=|<=|>|<)/ },
  { type: "ASIGNACION", regex: /^=/ },
  { type: "OP_ARITMETICO", regex: /^(\+|\-|\*|\/)/ },
  { type: "DELIMITADOR", regex: /^(;|,|\(|\)|\{|\})/ },
];

export function analyzeSource(sourceCode: string): AnalyzeResponse {
  const tokens: Token[] = [];
  const errors: LexicalError[] = [];
  let index = 0;
  let line = 1;

  while (index < sourceCode.length) {
    const currentChar = sourceCode[index];

    if (currentChar === "\n") {
      line += 1;
      index += 1;
      continue;
    }

    if (currentChar === " " || currentChar === "\t" || currentChar === "\r") {
      index += 1;
      continue;
    }

    const slice = sourceCode.slice(index);
    let matched = false;

    for (const rule of RULES) {
      const match = slice.match(rule.regex);
      if (!match) continue;

      const lexeme = match[0];
      const type = rule.type === "PALABRA_RESERVADA" && !RESERVED_WORDS.has(lexeme)
        ? "IDENTIFICADOR"
        : rule.type;

      tokens.push({
        id: randomUUID(),
        line,
        type,
        lexeme,
      });

      index += lexeme.length;
      matched = true;
      break;
    }

    if (!matched) {
      errors.push({
        id: randomUUID(),
        line,
        lexeme: currentChar,
        description: "Caracter no reconocido en el alfabeto MiniLang.",
      });
      break;
    }
  }

  return { tokens, errors };
}
