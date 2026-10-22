import { z } from 'zod';
import { cajas, importe } from './dinero.js';

const texto = (campo: string) => z.string().trim().min(1, `${campo} es obligatorio`);

export const manifiestoLineaSchema = z.object({
  producto: texto('El producto'),
  color: z.string().trim().optional(),
  tamano: texto('El tamaño'),
  cajas,
});

export const crearTrailerSchema = z.object({
  placa: texto('La placa'),
  numero: texto('El número de trailer'),
  invernadero: texto('El invernadero'),
  chofer: texto('El chofer'),
  anden: texto('El andén'),
  costoAnden: importe.nonnegative('El costo de andén no puede ser negativo'),
  manifiesto: z.array(manifiestoLineaSchema).min(1, 'Registra al menos un producto del manifiesto'),
});

export type ManifiestoLineaInput = z.infer<typeof manifiestoLineaSchema>;
export type CrearTrailerInput = z.infer<typeof crearTrailerSchema>;
