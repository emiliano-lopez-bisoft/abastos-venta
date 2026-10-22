import { z } from "zod";

// Mensajes de validación de Zod en español (aplica en backend y frontend).
z.config(z.locales.es());

export * from "./comun.js";
export * from "./dinero.js";
export * from "./trailer.js";
export * from "./ticket.js";
