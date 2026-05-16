import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/me", meRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
