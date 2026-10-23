import { z } from "zod";
import { cajas, importe } from "./dinero.js";

const texto = (mensaje: string) => z.string().trim().min(1, mensaje);

export const estadoTrailerSchema = z.enum(["ACTIVO", "CERRADO"]);
export type EstadoTrailer = z.infer<typeof estadoTrailerSchema>;

// ---------- Entradas ----------

export const manifiestoLineaSchema = z.object({
  producto: texto("El producto es obligatorio"),
  color: z.string().trim().optional(),
  tamano: texto("El tamaño es obligatorio"),
  cajas,
});

export const crearTrailerSchema = z.object({
  placa: texto("La placa es obligatoria"),
  numero: texto("El número de trailer es obligatorio"),
  invernadero: texto("El invernadero es obligatorio"),
  chofer: texto("El chofer es obligatorio"),
  anden: texto("El andén es obligatorio"),
  costoAnden: importe.nonnegative("El costo de andén no puede ser negativo"),
  // Opcionales: si no se mandan, el backend usa 0 de flete/descarga y 10 % de comisión.
  // (No se usa .default() porque en Zod 4 también se aplicaría en el PATCH
  // y sobrescribiría valores ya guardados).
  flete: importe.nonnegative("El flete no puede ser negativo").optional(),
  descarga: importe.nonnegative("La descarga no puede ser negativa").optional(),
  comisionPorcentaje: importe
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede ser mayor a 100 %")
    .optional(),
  manifiesto: z
    .array(manifiestoLineaSchema)
    .min(1, "Registra al menos un producto del manifiesto"),
});

/** Corrige datos generales del trailer (no toca el manifiesto). */
export const actualizarTrailerSchema = crearTrailerSchema
  .omit({ manifiesto: true })
  .partial()
  .refine(
    (d) => Object.keys(d).length > 0,
    "No se envió ningún campo para actualizar",
  );

export const actualizarManifiestoLineaSchema = manifiestoLineaSchema
  .partial()
  .refine(
    (d) => Object.keys(d).length > 0,
    "No se envió ningún campo para actualizar",
  );

export const listarTrailersQuerySchema = z.object({
  estado: estadoTrailerSchema.optional(),
});

export const manifiestoLineaParamsSchema = z.object({
  id: z.coerce.number().int().positive("Id de trailer inválido"),
  lineaId: z.coerce.number().int().positive("Id de línea inválido"),
});

export type ManifiestoLineaInput = z.infer<typeof manifiestoLineaSchema>;
export type CrearTrailerInput = z.infer<typeof crearTrailerSchema>;
export type ActualizarTrailerInput = z.infer<typeof actualizarTrailerSchema>;
export type ActualizarManifiestoLineaInput = z.infer<
  typeof actualizarManifiestoLineaSchema
>;

// ---------- Respuestas del API ----------

export interface ManifiestoLineaDto {
  id: number;
  producto: string;
  color: string | null;
  tamano: string;
  cajas: number;
  vendidas: number;
  disponibles: number;
}

export interface TrailerDto {
  id: number;
  placa: string;
  numero: string;
  invernadero: string;
  chofer: string;
  anden: string;
  costoAnden: number;
  flete: number;
  descarga: number;
  comisionPorcentaje: number;
  fechaLlegada: string;
  estado: EstadoTrailer;
  manifiesto: ManifiestoLineaDto[];
  totales: { cajas: number; vendidas: number; disponibles: number };
}
