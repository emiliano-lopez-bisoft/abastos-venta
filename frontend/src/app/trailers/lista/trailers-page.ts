import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { EstadoTrailer, ManifiestoLineaDto, TrailerDto } from '@abastos/shared';
import { colorDeChile, nombreProducto } from '../../core/catalogos';
import { mensajeDeError } from '../../core/errores';
import { TrailersApi } from '../trailers.api';

interface SegmentoExistencia {
  color: string;
  porcentaje: number;
}

@Component({
  selector: 'app-trailers-page',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './trailers-page.html',
  styleUrl: './trailers-page.scss',
})
export class TrailersPage {
  private readonly api = inject(TrailersApi);

  protected readonly estado = signal<EstadoTrailer>('ACTIVO');
  protected readonly trailers = this.api.listar(this.estado);

  protected readonly colorDeChile = colorDeChile;
  protected readonly mensajeDeError = mensajeDeError;

  /** Barra de existencias: un tramo por línea del manifiesto, del color del chile. */
  protected segmentos(t: TrailerDto): SegmentoExistencia[] {
    if (t.totales.cajas === 0) return [];
    return t.manifiesto
      .filter((l) => l.disponibles > 0)
      .map((l) => ({
        color: colorDeChile(l.color),
        porcentaje: (l.disponibles / t.totales.cajas) * 100,
      }));
  }

  protected nombreLinea(l: ManifiestoLineaDto): string {
    return nombreProducto(l.producto, l.color);
  }
}
