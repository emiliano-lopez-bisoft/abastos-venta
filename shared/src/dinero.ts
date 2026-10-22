import { z } from 'zod';

/**
 * Importe en pesos con máximo 2 decimales.
 * Viaja como number en JSON, pero el backend lo guarda como Decimal
 * y hace ahí los cálculos de totales (nunca sumar dinero en el frontend
 * como fuente de verdad).
 */
export const importe = z
  .number()
  .finite()
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, {
    message: 'Máximo 2 decimales',
  });

export const cajas = z.number().int('Las cajas deben ser un número entero').positive('Debe ser al menos 1 caja');
