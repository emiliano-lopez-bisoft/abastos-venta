import { DatePipe } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Margen para no confundir una respuesta fresca con una vieja por diferencias de reloj
const UMBRAL_MS = 2 * 60 * 1000;

@Component({
  selector: 'app-datos-guardados',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fecha(); as f) {
      <p class="aviso" role="status">
        Mostrando datos guardados de las {{ f | date: 'HH:mm' }}
        @if (esOtroDia()) {
          del {{ f | date: 'dd/MM' }}
        }
      </p>
    }
  `,
  styles: `
    .aviso {
      margin: 0 0 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.4rem;
      background: #fef3c7;
      color: #78350f;
      font-size: 0.85rem;
    }
  `,
})
export class DatosGuardados {
  /** Pasa aquí `recurso.headers()` de tu httpResource */
  readonly headers = input<HttpHeaders | undefined>();

  protected readonly fecha = computed(() => {
    const valor = this.headers()?.get('Date');
    if (!valor) return null;
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return null;
    return Date.now() - fecha.getTime() > UMBRAL_MS ? fecha : null;
  });

  protected readonly esOtroDia = computed(() => {
    const f = this.fecha();
    return !!f && f.toDateString() !== new Date().toDateString();
  });
}
