import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import stockRecordRoutes from "./routes/stockRecords.js";
import stockRoutes from "./routes/stocks.js";
import saleRoutes from "./routes/sales.js";
import shopRoutes from "./routes/shops.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stock-records", stockRecordRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/shops", shopRoutes);

// Express 5 forwards async errors here automatically
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => console.log(`API on :${config.port}`));
