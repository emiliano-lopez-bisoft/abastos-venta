import { z } from "zod";

/** Para validar ids que llegan en la URL (/api/trailers/:id). */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Id inválido"),
});
