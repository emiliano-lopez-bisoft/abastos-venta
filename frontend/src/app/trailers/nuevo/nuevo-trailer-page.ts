import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { crearTrailerSchema } from '@abastos/shared';
import { COLORES, PRODUCTO_POR_DEFECTO, TAMANOS, colorDeChile } from '../../core/catalogos';
import { ErrorCampo } from '../../core/error-campo';
import { mensajeDeError } from '../../core/errores';
import { TrailersApi } from '../trailers.api';

interface LineaForm {
  producto: string;
  color: string;
  tamano: string;
  cajas: number;
}

const lineaNueva = (anterior?: LineaForm): LineaForm => ({
  // Copia producto y color de la línea anterior: normalmente se capturan
  // varios tamaños seguidos del mismo chile.
  producto: anterior?.producto ?? PRODUCTO_POR_DEFECTO,
  color: anterior?.color ?? COLORES[0],
  tamano: '',
  cajas: 0,
});

@Component({
  selector: 'app-nuevo-trailer-page',
  imports: [FormField, ErrorCampo, RouterLink, DecimalPipe],
  templateUrl: './nuevo-trailer-page.html',
  styleUrl: './nuevo-trailer-page.scss',
})
export class NuevoTrailerPage {
  private readonly api = inject(TrailersApi);
  private readonly router = inject(Router);

  protected readonly colores = COLORES;
  protected readonly tamanos = TAMANOS;
  protected readonly colorDeChile = colorDeChile;

  protected readonly modelo = signal({
    numero: '',
    placa: '',
    invernadero: '',
    chofer: '',
    anden: '',
    costoAnden: 0,
    flete: 0,
    descarga: 0,
    comisionPorcentaje: 10,
    manifiesto: [lineaNueva()],
  });

  // Las mismas reglas que valida el backend, tomadas de @abastos/shared.
  protected readonly f = form(this.modelo, (ruta) =>
    validateStandardSchema(ruta, crearTrailerSchema),
  );

  protected readonly totalCajas = computed(() =>
    this.modelo().manifiesto.reduce((acc, l) => acc + (Number(l.cajas) || 0), 0),
  );

  protected readonly errorServidor = signal<string | null>(null);

  protected agregarLinea(): void {
    this.modelo.update((m) => ({
      ...m,
      manifiesto: [...m.manifiesto, lineaNueva(m.manifiesto.at(-1))],
    }));
  }

  protected quitarLinea(indice: number): void {
    this.modelo.update((m) => ({ ...m, manifiesto: m.manifiesto.filter((_, i) => i !== indice) }));
  }

  /** Al tocar un campo numérico se selecciona su contenido, para escribir encima del 0. */
  protected seleccionar(evento: FocusEvent): void {
    (evento.target as HTMLInputElement).select();
  }

  protected async guardar(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    this.errorServidor.set(null);

    await submit(this.f, async () => {
      try {
        await this.api.crear(this.modelo());
        await this.router.navigate(['/trailers']);
      } catch (error) {
        this.errorServidor.set(mensajeDeError(error));
      }
      return undefined;
    });
  }
}
