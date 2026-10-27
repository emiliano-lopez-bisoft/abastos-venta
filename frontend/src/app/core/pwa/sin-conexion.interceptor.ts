import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { SIN_CONEXION_PREVIA } from '../errores';

const METODOS_LECTURA = new Set(['GET', 'HEAD']);

/** Si no hay red, falla de inmediato las peticiones que modifican datos. */
export const sinConexionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!METODOS_LECTURA.has(req.method) && !navigator.onLine) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 0,
          statusText: SIN_CONEXION_PREVIA,
          url: req.urlWithParams,
        }),
    );
  }
  return next(req);
};
