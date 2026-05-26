export interface Token {
  id: string;
  line: number;
  type: string;
  lexeme: string;
}

export interface LexicalError {
  id: string;
  line: number;
  lexeme: string;
  description: string;
}

export interface AnalyzeRequest {
  sourceCode: string;
}

export interface AnalyzeResponse {
  tokens: Token[];
  errors: LexicalError[];
}
