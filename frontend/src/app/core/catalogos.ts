/** Variable CSS del color del chile, para pintar existencias y etiquetas. */
export function colorDeChile(color: string | null | undefined): string {
  const c = (color ?? '').toLowerCase();
  if (c.includes('rojo')) return 'var(--chile-rojo)';
  if (c.includes('amarillo')) return 'var(--chile-amarillo)';
  if (c.includes('naranja')) return 'var(--chile-naranja)';
  if (c.includes('verde')) return 'var(--chile-verde)';
  return 'var(--chile-otro)';
}

/** "Morrón Rojo", o solo "Pasilla" si el producto no lleva color. */
export function nombreProducto(producto: string, color: string | null | undefined): string {
  return [producto, color].filter(Boolean).join(' ');
}
