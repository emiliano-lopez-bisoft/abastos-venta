import { z } from 'zod';
import { cajas, importe } from './dinero.js';

export const ticketLineaSchema = z.object({
  /** Línea del manifiesto de la que salen las cajas (define trailer, producto y tamaño). */
  manifiestoDetalleId: z.number().int().positive(),
  cajas,
  precioCaja: importe.positive('El precio por caja debe ser mayor a 0'),
});

export const crearTicketSchema = z.object({
  clienteNombre: z.string().trim().min(1, 'El nombre del cliente es obligatorio'),
  lineas: z.array(ticketLineaSchema).min(1, 'Agrega al menos un producto al ticket'),
});

export type TicketLineaInput = z.infer<typeof ticketLineaSchema>;
export type CrearTicketInput = z.infer<typeof crearTicketSchema>;
