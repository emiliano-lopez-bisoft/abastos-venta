import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { trailersRouter } from "./modules/trailers/trailers.routes.js";
import { ticketsRouter } from "./modules/tickets/tickets.routes.js";
import { resumenRouter } from "./modules/resumen/resumen.routes.js";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/trailers", trailersRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/resumen", resumenRouter);

app.use(errorHandler);
