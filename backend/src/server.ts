import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyzeRoutes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", analyzeRoutes);

app.listen(PORT, () => {
  console.log(`MiniLang API running on http://localhost:${PORT}`);
});
