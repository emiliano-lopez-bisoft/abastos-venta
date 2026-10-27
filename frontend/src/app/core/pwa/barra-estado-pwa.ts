import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActualizacionesService } from './actualizaciones.service';
import { ConexionService } from './conexion.service';

@Component({
  selector: 'app-barra-estado-pwa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!conexion.enLinea()) {
      <div class="barra sin-red" role="status">
        Sin conexión. Puedes abrir la app, pero no guardar ni consultar datos hasta que regrese la
        señal.
      </div>
    }
    @if (actualizaciones.hayNuevaVersion()) {
      <div class="barra nueva-version" role="status">
        <span>Hay una nueva versión de la app.</span>
        <button type="button" (click)="actualizaciones.actualizar()">Actualizar</button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .barra {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .sin-red {
      background: #fef3c7;
      color: #78350f;
    }
    .nueva-version {
      background: #dbeafe;
      color: #1e3a8a;
    }
    button {
      border: 0;
      border-radius: 0.4rem;
      padding: 0.4rem 0.9rem;
      background: #1e3a8a;
      color: #fff;
      font-weight: 600;
    }
  `,
})
export class BarraEstadoPwa {
  protected readonly conexion = inject(ConexionService);
  protected readonly actualizaciones = inject(ActualizacionesService);
}
