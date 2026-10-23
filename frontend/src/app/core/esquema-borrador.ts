import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Permite validar un formulario con un esquema de @abastos/shared aunque el
 * formulario tenga valores "en borrador" que el esquema no acepta en su tipo
 * (por ejemplo, un tamaño todavía sin elegir ''). En tiempo de ejecución el
 * esquema valida igual y muestra el error correspondiente ("Elige un tamaño").
 */
export function esquemaParaBorrador<TBorrador>(
  esquema: StandardSchemaV1,
): StandardSchemaV1<TBorrador> {
  return esquema as StandardSchemaV1<TBorrador>;
}
