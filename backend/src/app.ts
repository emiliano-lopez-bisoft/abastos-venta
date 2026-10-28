import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { trailersRouter } from "./modules/trailers/trailers.routes.js";
import { ticketsRouter } from "./modules/tickets/tickets.routes.js";
import { resumenRouter } from "./modules/resumen/resumen.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.routes.js";
import { requiereSesion } from "./middlewares/requiere-sesion.js";

export const app = express();

app.set("trust proxy", 1);

app.use(cors({ origin: env.CORS_ORIGIN, exposedHeaders: ["Date"] }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use("/api", requiereSesion);

app.use("/api/trailers", trailersRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/resumen", resumenRouter);

app.use(errorHandler);
