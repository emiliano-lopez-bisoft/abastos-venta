import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NOMBRES_PRODUCTOS, TAMANOS, coloresDe, crearTrailerSchema } from '@abastos/shared';
import { colorDeChile } from '../../core/catalogos';
import { ErrorCampo } from '../../core/error-campo';
import { esquemaParaBorrador } from '../../core/esquema-borrador';
import { mensajeDeError } from '../../core/errores';
import { TrailersApi } from '../trailers.api';

interface LineaForm {
  producto: string;
  color: string;
  tamano: string;
  cajas: number;
}

interface ModeloTrailer {
  numero: string;
  placa: string;
  invernadero: string;
  chofer: string;
  anden: string;
  costoAnden: number;
  flete: number;
  descarga: number;
  comisionPorcentaje: number;
  manifiesto: LineaForm[];
}

function lineaNueva(anterior?: LineaForm): LineaForm {
  // Copia producto y color de la línea anterior: normalmente se capturan
  // varios tamaños seguidos del mismo chile.
  const producto = anterior?.producto ?? NOMBRES_PRODUCTOS[0];
  return {
    producto,
    color: anterior?.color ?? coloresDe(producto)[0] ?? '',
    tamano: '',
    cajas: 0,
  };
}

@Component({
  selector: 'app-nuevo-trailer-page',
  imports: [FormField, ErrorCampo, RouterLink, DecimalPipe],
  templateUrl: './nuevo-trailer-page.html',
  styleUrl: './nuevo-trailer-page.scss',
})
export class NuevoTrailerPage {
  private readonly api = inject(TrailersApi);
  private readonly router = inject(Router);

  protected readonly productos = NOMBRES_PRODUCTOS;
  protected readonly tamanos = TAMANOS;
  protected readonly coloresDe = coloresDe;
  protected readonly colorDeChile = colorDeChile;

  protected readonly modelo = signal<ModeloTrailer>({
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
    validateStandardSchema(ruta, esquemaParaBorrador<ModeloTrailer>(crearTrailerSchema)),
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
        // El formulario ya pasó la validación, así que los datos cumplen el esquema.
        await this.api.crear(crearTrailerSchema.parse(this.modelo()));
        await this.router.navigate(['/trailers']);
      } catch (error) {
        this.errorServidor.set(mensajeDeError(error));
      }
      return undefined;
    });
  }
}
