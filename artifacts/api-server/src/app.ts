import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { createProxyMiddleware } from "http-proxy-middleware";
import healthRouter from "./routes/health";
import { logger } from "./lib/logger";

const UPSTREAM = process.env["UPSTREAM_API_URL"] ?? "https://pyraride.fly.dev";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use("/health", healthRouter);

app.use(
  "/api",
  createProxyMiddleware({
    target: UPSTREAM,
    changeOrigin: true,
    headers: {
      "Accept": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    on: {
      error(err, _req, res: any) {
        logger.error({ err }, "Proxy error");
        if (!res.headersSent) {
          res.status(502).json({ error: "Upstream API unavailable" });
        }
      },
    },
  }),
);

export default app;
