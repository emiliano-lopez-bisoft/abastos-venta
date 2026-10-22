import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { healthRouter } from './modules/health/health.routes.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/health', healthRouter);
// Próximos módulos:
// app.use('/api/trailers', trailersRouter);
// app.use('/api/tickets', ticketsRouter);
// app.use('/api/resumen', resumenRouter);

app.use(errorHandler);
