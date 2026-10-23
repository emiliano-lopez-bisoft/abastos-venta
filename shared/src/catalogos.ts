/**
 * Catálogos del negocio. Para vender un producto nuevo
 * basta con agregarlo aquí: el backend lo empieza a aceptar y el frontend lo muestra
 * en las listas. No hace falta migración porque en la base se guarda como texto.
 */

/** Tamaños en el orden en que se manejan en la hoja de liquidación. */
export const TAMANOS = ["XXL", "XL", "LG", "MD", "SM", "CH"] as const;
export type Tamano = (typeof TAMANOS)[number];

/**
 * Productos y los colores en que vienen. Un producto sin colores
 * (lista vacía) no pide color al capturarlo.
 */
export const PRODUCTOS = {
  Morrón: ["Rojo", "Amarillo", "Naranja", "Verde"],
  // Pasilla: [],
} as const satisfies Record<string, readonly string[]>;

export type Producto = keyof typeof PRODUCTOS;
export const NOMBRES_PRODUCTOS = Object.keys(PRODUCTOS) as [
  Producto,
  ...Producto[],
];

/** Colores válidos de un producto (vacío si el producto no maneja color). */
export function coloresDe(producto: string): readonly string[] {
  return PRODUCTOS[producto as Producto] ?? [];
}

/** Revisa que el color corresponda al producto. Devuelve el error o null. */
export function errorDeColor(
  producto: string,
  color: string | null | undefined,
): string | null {
  const colores = coloresDe(producto);
  if (colores.length === 0) {
    return color ? `${producto} no lleva color` : null;
  }
  if (!color) return "Elige el color";
  return colores.includes(color)
    ? null
    : `${producto} no viene en color ${color}`;
}

/** Folio con ceros a la izquierda, como en los vales impresos: 324 → "00324". */
export const DIGITOS_FOLIO = 5;
export function formatearFolio(id: number): string {
  return String(id).padStart(DIGITOS_FOLIO, "0");
}
