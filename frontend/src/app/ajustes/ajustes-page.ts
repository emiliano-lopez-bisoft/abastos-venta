import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { ConexionService } from '../core/pwa/conexion.service';
import { esErrorDeConexion } from '../core/pwa/errores-red';

@Component({
  selector: 'app-ajustes-page',
  templateUrl: './ajustes-page.html',
  styleUrl: './ajustes-page.scss',
})
export class AjustesPage {
  protected readonly auth = inject(AuthService);
  protected readonly conexion = inject(ConexionService);

  protected readonly confirmando = signal(false);
  protected readonly saliendo = signal(false);
  protected readonly error = signal<string | null>(null);

  protected cancelar() {
    this.confirmando.set(false);
    this.error.set(null);
  }

  protected async salir() {
    this.error.set(null);
    this.saliendo.set(true);
    try {
      await this.auth.cerrarSesion();
    } catch (error) {
      this.error.set(
        esErrorDeConexion(error)
          ? 'Se perdió la conexión. La sesión sigue abierta; inténtalo cuando regrese la señal.'
          : 'Ocurrió un error inesperado.',
      );
    } finally {
      this.saliendo.set(false);
    }
  }
}
