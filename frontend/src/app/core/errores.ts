import { HttpErrorResponse } from '@angular/common/http';

/** statusText que usa el interceptor cuando corta una petición antes de enviarla. */
export const SIN_CONEXION_PREVIA = 'SIN_CONEXION_PREVIA';

/** 0: no hubo respuesta. 504: el service worker no tiene red ni copia guardada. */
function esErrorDeConexion(error: HttpErrorResponse): boolean {
  return !navigator.onLine || error.status === 0 || error.status === 504;
}

/** El backend responde { mensaje, errores } (ver error-handler.ts). */
function mensajeDelServidor(error: HttpErrorResponse): string | null {
  return (error.error as { mensaje?: string } | null)?.mensaje ?? null;
}

/** Para pantallas que consultan datos. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (esErrorDeConexion(error)) {
      return 'Sin conexión. Esta información no se ha consultado antes con internet; inténtalo cuando haya señal.';
    }
    const mensaje = mensajeDelServidor(error);
    if (mensaje) return mensaje;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

/** Para acciones que guardan datos (vale, trailer, cancelar, cerrar, reabrir). */
export function mensajeDeErrorAlGuardar(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.statusText === SIN_CONEXION_PREVIA) {
      return 'No hay conexión. No se guardó nada; inténtalo cuando regrese la señal.';
    }
    if (esErrorDeConexion(error)) {
      // La petición pudo llegar al servidor y perderse la respuesta: reintentar a ciegas puede duplicar.
      return 'Se perdió la conexión al guardar. Revisa si quedó registrado antes de intentarlo de nuevo.';
    }
  }
  return mensajeDeError(error);
}
