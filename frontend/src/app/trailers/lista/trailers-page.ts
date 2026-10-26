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

  protected readonly porCerrar = signal<number | null>(null);
  protected readonly procesando = signal<number | null>(null);
  protected readonly errorAccion = signal<{ id: number; mensaje: string } | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly colorDeChile = colorDeChile;
  protected readonly mensajeDeError = mensajeDeError;

  protected cambiarEstado(estado: EstadoTrailer): void {
    this.estado.set(estado);
    this.porCerrar.set(null);
    this.aviso.set(null);
  }

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

  protected pedirCierre(id: number): void {
    this.errorAccion.set(null);
    this.aviso.set(null);
    this.porCerrar.set(id);
  }

  protected cerrar(t: TrailerDto): Promise<void> {
    return this.ejecutar(
      t,
      () => this.api.cerrar(t.id),
      `El trailer ${t.numero} se pasó a Cerrados`,
    );
  }

  protected reabrir(t: TrailerDto): Promise<void> {
    return this.ejecutar(
      t,
      () => this.api.reabrir(t.id),
      `El trailer ${t.numero} volvió al andén.`,
    );
  }

  private async ejecutar(
    t: TrailerDto,
    accion: () => Promise<unknown>,
    exito: string,
  ): Promise<void> {
    this.procesando.set(t.id);
    this.errorAccion.set(null);
    try {
      await accion();
      this.porCerrar.set(null);
      this.aviso.set(exito);
      this.trailers.reload();
    } catch (error) {
      this.errorAccion.set({ id: t.id, mensaje: mensajeDeError(error) });
    } finally {
      this.procesando.set(null);
    }
  }
}
