import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConexionService } from './conexion.service';

@Component({
  selector: 'app-aviso-conexion-guardar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!conexion.enLinea()) {
      <p class="aviso" role="status">Se necesita conexión a internet para guardar.</p>
    }
  `,
  styles: `
    .aviso {
      margin: 0.5rem 0 0;
      color: #b45309;
      font-size: 0.85rem;
      font-weight: 500;
    }
  `,
})
export class AvisoConexionGuardar {
  protected readonly conexion = inject(ConexionService);
}
