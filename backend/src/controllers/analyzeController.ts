import type { Request, Response } from "express";
import { analyzeSource } from "../services/analyzerService";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/analysis";

export function analyzeController(
  req: Request<unknown, AnalyzeResponse, AnalyzeRequest>,
  res: Response<AnalyzeResponse>
) {
  const { sourceCode } = req.body;

  if (typeof sourceCode !== "string") {
    return res.status(400).json({
      tokens: [],
      errors: [
        {
          id: "invalid-request",
          line: 1,
          lexeme: "",
          description: "El campo sourceCode es requerido y debe ser string.",
        },
      ],
    });
  }

  const result = analyzeSource(sourceCode);
  return res.json(result);
}
