import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { loginSchema } from '@abastos/shared';
import { AuthService } from '../core/auth/auth.service';
import { ConexionService } from '../core/pwa/conexion.service'; // ADAPTAR a tu ruta real
import { esErrorDeConexion } from '../core/pwa/errores-red';
import { PrecargaService } from '../core/pwa/precarga.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly precarga = inject(PrecargaService);
  protected readonly conexion = inject(ConexionService);

  protected readonly usuario = signal('');
  protected readonly contrasena = signal('');
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly mostrarContrasena = signal(false);

  protected async entrar(evento: Event) {
    evento.preventDefault();
    this.error.set(null);

    const datos = loginSchema.safeParse({ usuario: this.usuario(), contrasena: this.contrasena() });
    if (!datos.success) {
      this.error.set(datos.error.issues[0]?.message ?? 'Revisa los datos');
      return;
    }

    this.enviando.set(true);
    try {
      await this.auth.iniciarSesion(datos.data);
      void this.precarga.iniciar();
      await this.router.navigateByUrl('/');
    } catch (error) {
      if (esErrorDeConexion(error)) {
        this.error.set('No hay conexión. Necesitas internet para entrar.');
      } else if (error instanceof HttpErrorResponse && error.error?.mensaje) {
        this.error.set(error.error.mensaje);
      } else {
        this.error.set('Ocurrió un error inesperado.');
      }
    } finally {
      this.enviando.set(false);
    }
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }
}
