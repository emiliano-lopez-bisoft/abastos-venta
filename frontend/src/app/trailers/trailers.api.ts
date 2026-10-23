import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import type { CrearTrailerInput, EstadoTrailer, TrailerDto } from '@abastos/shared';
import { firstValueFrom } from 'rxjs';

const URL = '/api/trailers';

@Injectable({ providedIn: 'root' })
export class TrailersApi {
  private readonly http = inject(HttpClient);

  /** Lista reactiva: se vuelve a pedir sola cuando cambia el estado. */
  listar(estado: Signal<EstadoTrailer>) {
    return httpResource<TrailerDto[]>(() => ({ url: URL, params: { estado: estado() } }), {
      defaultValue: [],
    });
  }

  crear(datos: CrearTrailerInput): Promise<TrailerDto> {
    return firstValueFrom(this.http.post<TrailerDto>(URL, datos));
  }
}
