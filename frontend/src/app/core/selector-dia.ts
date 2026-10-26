import { Component, computed, model } from '@angular/core';
import { hoyCdmx, sumarDias } from './fechas';

/** Flechas de día anterior/siguiente y selector de fecha. Uso: <app-selector-dia [(fecha)]="fecha" /> */
@Component({
  selector: 'app-selector-dia',
  template: `
    <div class="dia" role="group" aria-label="Elegir día">
      <button
        type="button"
        class="boton boton--secundario"
        (click)="cambiar(-1)"
        aria-label="Día anterior"
      >
        ‹
      </button>
      <input
        type="date"
        [value]="fecha()"
        [max]="hoy()"
        (change)="elegir($event)"
        aria-label="Fecha"
      />
      <button
        type="button"
        class="boton boton--secundario"
        (click)="cambiar(1)"
        [disabled]="esHoy()"
        aria-label="Día siguiente"
      >
        ›
      </button>
    </div>
    @if (!esHoy()) {
      <button type="button" class="hoy" (click)="fecha.set(hoy())">Volver a hoy</button>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.5rem;
    }

    .dia {
      display: grid;
      grid-template-columns: var(--toque) 1fr var(--toque);
      gap: 0.5rem;

      .boton {
        padding: 0;
        font-size: 1.5rem;
      }

      input {
        min-height: var(--toque);
        padding: 0 0.75rem;
        border: 1.5px solid var(--linea);
        border-radius: var(--radio-chico);
        background: var(--superficie);
        color: var(--tinta);
        font: 600 1.0625rem var(--fuente);
      }
    }

    .hoy {
      justify-self: end;
      padding: 0;
      border: 0;
      background: none;
      color: var(--primario);
      font: 600 1rem var(--fuente);
      cursor: pointer;
    }
  `,
})
export class SelectorDia {
  /** Fecha AAAA-MM-DD; se actualiza en el componente que lo usa. */
  readonly fecha = model.required<string>();

  protected readonly hoy = hoyCdmx;
  protected readonly esHoy = computed(() => this.fecha() === hoyCdmx());

  protected cambiar(dias: number): void {
    this.fecha.update((f) => sumarDias(f, dias));
  }

  protected elegir(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.fecha.set(valor);
  }
}
