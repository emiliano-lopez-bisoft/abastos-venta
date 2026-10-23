import { HttpErrorResponse } from '@angular/common/http';

/** Convierte cualquier error de una petición en un mensaje para mostrar en pantalla. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
    }
    // El backend responde { mensaje, errores } (ver error-handler.ts).
    const mensaje = (error.error as { mensaje?: string } | null)?.mensaje;
    if (mensaje) return mensaje;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
