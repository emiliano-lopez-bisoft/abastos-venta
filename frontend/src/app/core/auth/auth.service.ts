import { LoginInput, SesionUsuario } from '@abastos/shared';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { esErrorDeConexion } from '../pwa/errores-red';

const API = 'api/auth';
const CLAVE_USUARIO = 'abastos.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _usuario = signal<string | null>(null);
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);

  async verificarSesion(): Promise<void> {
    try {
      const r = await firstValueFrom(
        this.http.get<SesionUsuario>(`${API}/yo`, { headers: { 'ngsw-bypass': 'true' } }),
      );
      this.recordar(r.usuario);
    } catch (error) {
      if (esErrorDeConexion(error)) {
        this._usuario.set(this.leerGuardado());
      } else {
        this.olvidar();
      }
    }
  }

  async iniciarSesion(datos: LoginInput): Promise<void> {
    const r = await firstValueFrom(this.http.post<SesionUsuario>(`${API}/login`, datos));
    this.recordar(r.usuario);
  }

  /** Requiere conexión: si falla, lanza el error y la sesión sigue abierta */
  async cerrarSesion(): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${API}/logout`, {}));
    this.olvidar();
    await this.router.navigateByUrl('/login');
  }

  /** El servidor respondió 401 en alguna petición */
  sesionExpirada(): void {
    this.olvidar();
    void this.router.navigateByUrl('/login');
  }

  private recordar(usuario: string) {
    this._usuario.set(usuario);
    try {
      localStorage.setItem(CLAVE_USUARIO, usuario);
    } catch {
      /* sin almacenamiento */
    }
  }

  private olvidar() {
    this._usuario.set(null);
    try {
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      /* sin almacenamiento */
    }
  }

  private leerGuardado(): string | null {
    try {
      return localStorage.getItem(CLAVE_USUARIO);
    } catch {
      return null;
    }
  }
}
