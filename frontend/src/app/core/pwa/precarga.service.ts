import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TrailerDto } from '@abastos/shared';
import { firstValueFrom } from 'rxjs';
import { hoyCdmx } from '../fechas';

const INTERVALO_MINIMO_MS = 5 * 60 * 1000;

/** Llena la caché del service worker con lo que tu tío consulta en el andén. */
@Injectable({ providedIn: 'root' })
export class PrecargaService {
  private readonly http = inject(HttpClient);
  private ultimaPrecarga = 0;
  private enCurso = false;

  iniciar(): void {
    void this.precargar();
    window.addEventListener('online', () => void this.precargar());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void this.precargar();
    });
  }

  private async precargar(): Promise<void> {
    // Sin service worker controlando la página, las respuestas no se guardan.
    if (!navigator.onLine || !navigator.serviceWorker?.controller) return;
    if (this.enCurso || Date.now() - this.ultimaPrecarga < INTERVALO_MINIMO_MS) return;

    this.enCurso = true;
    try {
      // Misma URL que TrailersApi.listar('ACTIVO'): la usan Trailers y Vender.
      const activos = await firstValueFrom(
        this.http.get<TrailerDto[]>('/api/trailers', { params: { estado: 'ACTIVO' } }),
      );

      const hoy = hoyCdmx();
      await Promise.allSettled([
        firstValueFrom(this.http.get('/api/tickets', { params: { fecha: hoy } })),
        firstValueFrom(this.http.get('/api/resumen/dia', { params: { fecha: hoy } })),
        ...activos.map((t) => firstValueFrom(this.http.get(`/api/resumen/trailers/${t.id}`))),
      ]);

      this.ultimaPrecarga = Date.now();
    } catch {
      // Falló la lista principal: se reintenta en el siguiente evento.
    } finally {
      this.enCurso = false;
    }
  }
}
