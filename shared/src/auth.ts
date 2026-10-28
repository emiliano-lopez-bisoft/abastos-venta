import { z } from "zod";

export const loginSchema = z.object({
  usuario: z.string().trim().toLowerCase().min(1, "Escribe tu usuario").max(50),
  contrasena: z.string().min(1, "Escribe tu contraseña").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface SesionUsuario {
  usuario: string;
}
