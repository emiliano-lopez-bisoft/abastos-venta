/** Tamaños en el orden en que tu tío los maneja en su hoja. */
export const TAMANOS = ['XXL', 'XL', 'LG', 'MD', 'SM', 'CH'] as const;

export const COLORES = ['Rojo', 'Amarillo', 'Naranja', 'Verde'] as const;

export const PRODUCTO_POR_DEFECTO = 'Pimiento';

/** Variable CSS del color del chile, para pintar existencias y etiquetas. */
export function colorDeChile(color: string | null | undefined): string {
  const c = (color ?? '').toLowerCase();
  if (c.includes('rojo')) return 'var(--chile-rojo)';
  if (c.includes('amarillo')) return 'var(--chile-amarillo)';
  if (c.includes('naranja')) return 'var(--chile-naranja)';
  if (c.includes('verde')) return 'var(--chile-verde)';
  return 'var(--chile-otro)';
}
