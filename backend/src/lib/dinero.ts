import { Prisma } from "../generated/prisma/client.js";

/** number → string con 2 decimales para guardarlo como Decimal sin errores de punto flotante. */
export const aDecimal = (valor: number) => valor.toFixed(2);

/** Decimal de la base → number para el JSON de respuesta. */
export const aNumero = (valor: Prisma.Decimal) => valor.toNumber();

/** Crea un Decimal exacto a partir de un number con máximo 2 decimales. */
export const decimal = (valor: number) => new Prisma.Decimal(aDecimal(valor));
