import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeDeError } from '../../core/errores';
import { hoyCdmx } from '../../core/fechas';
import { SelectorDia } from '../../core/selector-dia';
import { ResumenApi } from '../resumen.api';
import { DatosGuardados } from '../../core/pwa/datos-guardados';

@Component({
  selector: 'app-resumen-dia-page',
  imports: [RouterLink, SelectorDia, CurrencyPipe, DecimalPipe, DatosGuardados],
  templateUrl: './resumen-dia-page.html',
  styleUrl: './resumen-dia-page.scss',
})
export class ResumenDiaPage {
  protected readonly fecha = signal(hoyCdmx());
  protected readonly resumen = inject(ResumenApi).delDia(this.fecha);
  protected readonly mensajeDeError = mensajeDeError;
}
