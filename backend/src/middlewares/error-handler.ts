import type { ErrorRequestHandler } from 'express';
import { ZodError, z } from 'zod';

/** Error de negocio con código HTTP (ej. "no hay cajas suficientes" → 409). */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ mensaje: 'Datos inválidos', errores: z.flattenError(err).fieldErrors });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ mensaje: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
};
