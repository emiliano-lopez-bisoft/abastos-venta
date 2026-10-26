import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatearFolio } from '@abastos/shared';
import { colorDeChile, nombreProducto } from '../../core/catalogos';
import { mensajeDeError } from '../../core/errores';
import { sumarDias } from '../../core/fechas';
import { ValesApi } from '../vales.api';
import { hoyCdmx } from '../../core/fechas';
import { SelectorDia } from '../../core/selector-dia';

@Component({
  selector: 'app-vales-page',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, SelectorDia],
  templateUrl: './vales-page.html',
  styleUrl: './vales-page.scss',
})
export class ValesPage {
  private readonly api = inject(ValesApi);

  protected readonly fecha = signal(hoyCdmx());
  protected readonly vales = this.api.listar(this.fecha);
  protected readonly esHoy = computed(() => this.fecha() === hoyCdmx());

  /** Totales del día; los vales cancelados no cuentan. */
  protected readonly resumen = computed(() => {
    const vigentes = this.vales.value().filter((v) => v.estado === 'VIGENTE');
    // Se suma en centavos para evitar errores de redondeo.
    const centavos = vigentes.reduce((acc, v) => acc + Math.round(v.total * 100), 0);
    return {
      vales: vigentes.length,
      cajas: vigentes.reduce((acc, v) => acc + v.totalCajas, 0),
      total: centavos / 100,
      cancelados: this.vales.value().length - vigentes.length,
    };
  });

  /** Vale que está pidiendo confirmación para cancelarse. */
  protected readonly porCancelar = signal<number | null>(null);
  protected readonly cancelando = signal(false);
  protected readonly errorCancelar = signal<string | null>(null);

  protected readonly colorDeChile = colorDeChile;
  protected readonly nombreProducto = nombreProducto;
  protected readonly formatearFolio = formatearFolio;
  protected readonly mensajeDeError = mensajeDeError;

  protected pedirConfirmacion(id: number): void {
    this.errorCancelar.set(null);
    this.porCancelar.set(id);
  }

  protected async cancelar(id: number): Promise<void> {
    this.cancelando.set(true);
    this.errorCancelar.set(null);
    try {
      await this.api.cancelar(id);
      this.porCancelar.set(null);
      this.vales.reload();
    } catch (error) {
      this.errorCancelar.set(mensajeDeError(error));
    } finally {
      this.cancelando.set(false);
    }
  }
}
